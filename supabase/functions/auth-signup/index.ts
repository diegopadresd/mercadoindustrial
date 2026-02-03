import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  rfc?: string;
  fiscalDocumentUrl?: string;
  redirectUrl: string;
}

const sendConfirmationEmail = async (email: string, fullName: string, confirmationUrl: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Mercado Industrial <noreply@alcance.co>",
      to: [email],
      subject: "Confirma tu cuenta en Mercado Industrial",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: bold;">Mercado Industrial</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">El marketplace industrial más grande de México</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">¡Bienvenido, ${fullName}!</h2>
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Gracias por registrarte en Mercado Industrial. Para completar tu registro y comenzar a explorar nuestro catálogo de maquinaria y equipos industriales, confirma tu correo electrónico.
                      </p>
                      
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding: 30px 0;">
                            <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #1a1a2e; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(212, 175, 55, 0.3);">
                              Confirmar mi cuenta
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #6a6a6a; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:
                      </p>
                      <p style="color: #d4af37; font-size: 12px; word-break: break-all; margin: 10px 0 0 0;">
                        ${confirmationUrl}
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                      
                      <p style="color: #6a6a6a; font-size: 12px; margin: 0;">
                        Este enlace expira en 24 horas. Si no solicitaste esta cuenta, puedes ignorar este correo.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="color: #888888; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Mercado Industrial. Todos los derechos reservados.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Resend error:", response.status, errorData);
    throw new Error(`Error enviando email: ${response.status}`);
  }

  return response.json();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      password,
      fullName,
      phone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPostalCode,
      rfc,
      fiscalDocumentUrl,
      redirectUrl,
    }: SignupRequest = await req.json();

    if (!email || !password || !fullName) {
      throw new Error("Email, contraseña y nombre son requeridos");
    }

    // Create admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create user with admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      if (createError.message.includes("already been registered")) {
        throw new Error("Este correo electrónico ya está registrado");
      }
      throw createError;
    }

    const userId = userData.user.id;

    // Create profile
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      user_id: userId,
      email,
      full_name: fullName,
      phone,
      shipping_address: shippingAddress,
      shipping_city: shippingCity,
      shipping_state: shippingState,
      shipping_postal_code: shippingPostalCode,
      shipping_country: "México",
      rfc,
      fiscal_document_url: fiscalDocumentUrl,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
    }

    // Create default user role
    await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: "user",
    });

    // Generate email confirmation link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (linkError) {
      console.error("Error generating link:", linkError);
      throw new Error("Error generando enlace de confirmación");
    }

    // Send confirmation email via Resend
    const confirmationUrl = linkData.properties.action_link;
    await sendConfirmationEmail(email, fullName, confirmationUrl);

    console.log(`User created and confirmation email sent to ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Usuario creado. Revisa tu correo para confirmar tu cuenta.",
        userId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in auth-signup:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
