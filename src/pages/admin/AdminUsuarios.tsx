import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, getRoleLabel, AppRole } from '@/hooks/useUserRole';
import { 
  Users, 
  Search,
  Plus,
  Mail,
  Shield,
  Ban,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Loader2,
  UserPlus,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import AccessDenied from '@/components/admin/AccessDenied';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  status: string | null;
  company_id: string | null;
  created_at: string;
  role: AppRole;
}

interface Invitation {
  id: string;
  email: string;
  role: AppRole;
  status: string;
  created_at: string;
  expires_at: string;
}

const AdminUsuarios = () => {
  const { user } = useAuth();
  const { isAdmin, permissions, isLoading: roleLoading } = useUserRole();
  const [search, setSearch] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [inviteData, setInviteData] = useState({ email: '', role: 'vendedor' as AppRole });
  const [newRole, setNewRole] = useState<AppRole>('vendedor');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users with their roles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      // First get all profiles
      let profilesQuery = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        profilesQuery = profilesQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      // Get roles for all users
      const userIds = profiles?.map(p => p.user_id) || [];
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Merge data
      return profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          ...profile,
          role: (userRole?.role || 'user') as AppRole,
        };
      }) as UserWithRole[];
    },
    enabled: isAdmin,
  });

  // Fetch invitations
  const { data: invitations, isLoading: invitationsLoading } = useQuery({
    queryKey: ['admin-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Invitation[];
    },
    enabled: isAdmin,
  });

  // Create invitation mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: AppRole }) => {
      const { error } = await supabase
        .from('invitations')
        .insert({
          email: data.email,
          role: data.role,
          invited_by: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] });
      toast({
        title: 'Invitación enviada',
        description: `Se ha enviado una invitación a ${inviteData.email}`,
      });
      setShowInviteDialog(false);
      setInviteData({ email: '', role: 'vendedor' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar la invitación',
        variant: 'destructive',
      });
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // First delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Rol actualizado',
        description: 'El rol del usuario ha sido actualizado correctamente',
      });
      setShowRoleDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el rol',
        variant: 'destructive',
      });
    },
  });

  // Deactivate user mutation
  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Usuario desactivado',
        description: 'El acceso del usuario ha sido desactivado',
      });
      setShowDeactivateDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo desactivar el usuario',
        variant: 'destructive',
      });
    },
  });

  // Reactivate user mutation
  const reactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Usuario reactivado',
        description: 'El acceso del usuario ha sido restaurado',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo reactivar el usuario',
        variant: 'destructive',
      });
    },
  });

  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] });
      toast({
        title: 'Invitación eliminada',
        description: 'La invitación ha sido eliminada',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la invitación',
        variant: 'destructive',
      });
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email) {
      toast({
        title: 'Error',
        description: 'El correo electrónico es requerido',
        variant: 'destructive',
      });
      return;
    }
    inviteMutation.mutate(inviteData);
  };

  const handleChangeRole = () => {
    if (!selectedUser) return;
    changeRoleMutation.mutate({ userId: selectedUser.user_id, newRole });
  };

  const handleDeactivate = () => {
    if (!selectedUser) return;
    deactivateMutation.mutate(selectedUser.user_id);
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'operador': return 'default';
      case 'vendedor': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'inactive') {
      return <Badge variant="outline" className="text-red-500 border-red-500">Inactivo</Badge>;
    }
    return <Badge variant="outline" className="text-green-500 border-green-500">Activo</Badge>;
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!permissions.canViewUsers) {
    return <AccessDenied message="Solo los administradores pueden acceder a la gestión de usuarios." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Usuarios
          </h1>
          <p className="text-muted-foreground">
            {users?.length || 0} usuarios registrados
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button className="btn-gold" onClick={() => setShowInviteDialog(true)}>
            <UserPlus size={18} className="mr-2" />
            Invitar Usuario
          </Button>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations && invitations.filter(i => i.status === 'pending').length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Mail size={18} className="text-primary" />
            Invitaciones Pendientes
          </h3>
          <div className="space-y-3">
            {invitations.filter(i => i.status === 'pending').map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Clock size={16} className="text-yellow-500" />
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Rol: {getRoleLabel(invitation.role)} • Expira: {new Date(invitation.expires_at).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => deleteInvitationMutation.mutate(invitation.id)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {usersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                users?.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Users size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{userData.full_name}</p>
                          <p className="text-sm text-muted-foreground">{userData.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(userData.role)}>
                        {getRoleLabel(userData.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(userData.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(userData.created_at).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(userData);
                              setNewRole(userData.role);
                              setShowRoleDialog(true);
                            }}
                          >
                            <Shield size={16} className="mr-2" />
                            Cambiar Rol
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {userData.status === 'inactive' ? (
                            <DropdownMenuItem
                              onClick={() => reactivateMutation.mutate(userData.user_id)}
                            >
                              <CheckCircle size={16} className="mr-2 text-green-500" />
                              Reactivar Acceso
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => {
                                setSelectedUser(userData);
                                setShowDeactivateDialog(true);
                              }}
                            >
                              <Ban size={16} className="mr-2" />
                              Desactivar Acceso
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar Usuario</DialogTitle>
            <DialogDescription>
              Envía una invitación para agregar un nuevo usuario al sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={inviteData.role}
                onValueChange={(value) => setInviteData({ ...inviteData, role: value as AppRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                Enviar Invitación
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol</DialogTitle>
            <DialogDescription>
              Cambia el rol de {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nuevo Rol</Label>
              <Select value={newRole} onValueChange={(value) => setNewRole(value as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeRole} disabled={changeRoleMutation.isPending}>
              {changeRoleMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar acceso?</AlertDialogTitle>
            <AlertDialogDescription>
              El usuario {selectedUser?.full_name} no podrá acceder al sistema hasta que su cuenta sea reactivada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsuarios;
