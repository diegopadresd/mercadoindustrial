import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !requestingUser) {
      throw new Error('Invalid token')
    }

    // Check if requesting user is admin
    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .eq('role', 'admin')
      .single()

    if (!adminRole) {
      throw new Error('Unauthorized: Admin access required')
    }

    const { action, ...params } = await req.json()

    switch (action) {
      case 'create': {
        const { email, password, full_name, role, phone } = params

        if (!email || !password || !full_name || !role) {
          throw new Error('Missing required fields: email, password, full_name, role')
        }

        // Create user in auth
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })

        if (createError) {
          throw createError
        }

        const userId = authData.user.id

        // Create profile
        const { error: profileError } = await supabaseAdmin.from('profiles').insert({
          user_id: userId,
          email,
          full_name,
          phone: phone || null,
          status: 'active',
        })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Rollback: delete the auth user
          await supabaseAdmin.auth.admin.deleteUser(userId)
          throw new Error('Failed to create profile')
        }

        // Assign role
        const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
          user_id: userId,
          role: role,
        })

        if (roleError) {
          console.error('Role assignment error:', roleError)
        }

        return new Response(
          JSON.stringify({ success: true, user_id: userId, message: 'Usuario creado exitosamente' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        const { user_id } = params

        if (!user_id) {
          throw new Error('Missing user_id')
        }

        // Prevent self-deletion
        if (user_id === requestingUser.id) {
          throw new Error('Cannot delete your own account')
        }

        // Delete user from auth (this will cascade to profiles and user_roles)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id)

        if (deleteError) {
          throw deleteError
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Usuario eliminado exitosamente' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_status': {
        const { user_id, status } = params

        if (!user_id || !status) {
          throw new Error('Missing user_id or status')
        }

        // Update profile status
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ status })
          .eq('user_id', user_id)

        if (updateError) {
          throw updateError
        }

        // If deactivating, also ban the user in auth
        if (status === 'inactive') {
          await supabaseAdmin.auth.admin.updateUserById(user_id, {
            ban_duration: '876000h' // ~100 years
          })
        } else if (status === 'active') {
          await supabaseAdmin.auth.admin.updateUserById(user_id, {
            ban_duration: 'none'
          })
        }

        return new Response(
          JSON.stringify({ success: true, message: `Estado actualizado a ${status}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_role': {
        const { user_id, new_role } = params

        if (!user_id || !new_role) {
          throw new Error('Missing user_id or new_role')
        }

        // Delete existing roles
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', user_id)

        // Insert new role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id, role: new_role })

        if (roleError) {
          throw roleError
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Rol actualizado exitosamente' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('manage-users error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
