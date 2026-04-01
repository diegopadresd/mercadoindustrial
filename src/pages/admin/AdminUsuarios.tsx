import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, getRoleLabel, AppRole } from '@/hooks/useUserRole';
import { 
  Users, 
  Search,
  Mail,
  Shield,
  Ban,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Loader2,
  UserPlus,
  X,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  Calendar,
  Package,
  FileText,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AccessDenied from '@/components/admin/AccessDenied';
import { VendorProductsDialog } from '@/components/admin/VendorProductsDialog';

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

interface SellerApplication {
  id: string;
  user_id: string;
  full_name: string;
  ine_url: string | null;
  birth_date: string;
  company_name: string | null;
  items_description: string;
  rfc: string | null;
  phone: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user_email?: string;
}

const AdminUsuarios = () => {
  const { user } = useAuth();
  const { isAdmin, permissions, isLoading: roleLoading } = useUserRole();
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showVendorProductsDialog, setShowVendorProductsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<UserWithRole | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('vendedor');
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'vendedor' as AppRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users with their roles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      let profilesQuery = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        profilesQuery = profilesQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      const userIds = profiles?.map(p => p.user_id) || [];
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

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

  // Fetch pending seller applications
  const { data: pendingApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['seller-applications-pending'],
    queryFn: async () => {
      const { data: applications, error } = await supabase
        .from('seller_applications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get emails for users
      if (applications && applications.length > 0) {
        const userIds = applications.map(a => a.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', userIds);

        return applications.map(app => ({
          ...app,
          user_email: profiles?.find(p => p.user_id === app.user_id)?.email || 'Sin correo',
        })) as SellerApplication[];
      }

      return applications as SellerApplication[];
    },
    enabled: isAdmin,
  });

  // Create user mutation (using edge function)
  const createUserMutation = useMutation({
    mutationFn: async (data: typeof createFormData) => {
      const { data: result, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          phone: data.phone || null,
          role: data.role,
        },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Usuario creado',
        description: `Se ha creado la cuenta para ${createFormData.email}`,
      });
      setShowCreateDialog(false);
      setCreateFormData({ email: '', password: '', full_name: '', phone: '', role: 'vendedor' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el usuario',
        variant: 'destructive',
      });
    },
  });

  // Change role mutation (using edge function)
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { data: result, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'update_role',
          user_id: userId,
          new_role: newRole,
        },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
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

  // Update status mutation (using edge function)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { data: result, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'update_status',
          user_id: userId,
          status,
        },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: variables.status === 'active' ? 'Usuario reactivado' : 'Usuario desactivado',
        description: variables.status === 'active' 
          ? 'El acceso del usuario ha sido restaurado'
          : 'El acceso del usuario ha sido desactivado',
      });
      setShowDeactivateDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    },
  });

  // Delete user mutation (using edge function)
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: result, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          user_id: userId,
        },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Usuario eliminado',
        description: 'La cuenta ha sido eliminada permanentemente',
      });
      setShowDeleteDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
    },
  });

  // Approve seller application mutation
  const approveApplicationMutation = useMutation({
    mutationFn: async (application: SellerApplication) => {
      // Update profile with RFC if provided
      if (application.rfc) {
        await supabase
          .from('profiles')
          .update({ 
            rfc: application.rfc,
            phone: application.phone,
          })
          .eq('user_id', application.user_id);
      }

      // Add vendedor role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: application.user_id,
          role: 'vendedor',
        }, { onConflict: 'user_id,role' });

      if (roleError && roleError.code !== '23505') throw roleError;

      // Update application status
      const { error: appError } = await supabase
        .from('seller_applications')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', application.id);

      if (appError) throw appError;

      // Create notification for user
      await supabase.from('notifications').insert({
        user_id: application.user_id,
        type: 'seller_approved',
        title: '¡Solicitud Aprobada!',
        message: 'Tu solicitud de vendedor ha sido aprobada. Ya puedes publicar productos.',
        action_url: '/mi-cuenta/publicar',
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-applications-pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Solicitud aprobada',
        description: 'El usuario ahora es vendedor y puede publicar productos.',
      });
      setShowApplicationDialog(false);
      setSelectedApplication(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo aprobar la solicitud',
        variant: 'destructive',
      });
    },
  });

  // Reject seller application mutation
  const rejectApplicationMutation = useMutation({
    mutationFn: async ({ application, reason }: { application: SellerApplication; reason: string }) => {
      const { error } = await supabase
        .from('seller_applications')
        .update({
          status: 'rejected',
          admin_notes: reason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', application.id);

      if (error) throw error;

      // Create notification for user
      await supabase.from('notifications').insert({
        user_id: application.user_id,
        type: 'seller_rejected',
        title: 'Solicitud Rechazada',
        message: `Tu solicitud de vendedor no fue aprobada. Motivo: ${reason}`,
        action_url: '/mi-cuenta/vender',
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-applications-pending'] });
      toast({
        title: 'Solicitud rechazada',
        description: 'Se ha notificado al usuario.',
      });
      setShowRejectDialog(false);
      setShowApplicationDialog(false);
      setSelectedApplication(null);
      setRejectReason('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo rechazar la solicitud',
        variant: 'destructive',
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.email || !createFormData.password || !createFormData.full_name) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }
    if (createFormData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }
    createUserMutation.mutate(createFormData);
  };

  const handleChangeRole = () => {
    if (!selectedUser) return;
    changeRoleMutation.mutate({ userId: selectedUser.user_id, newRole });
  };

  const handleDeactivate = () => {
    if (!selectedUser) return;
    updateStatusMutation.mutate({ userId: selectedUser.user_id, status: 'inactive' });
  };

  const handleReactivate = (userId: string) => {
    updateStatusMutation.mutate({ userId, status: 'active' });
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.user_id);
  };

  const handleApproveApplication = () => {
    if (!selectedApplication) return;
    approveApplicationMutation.mutate(selectedApplication);
  };

  const handleRejectApplication = () => {
    if (!selectedApplication || !rejectReason.trim()) {
      toast({
        title: 'Error',
        description: 'Debes proporcionar un motivo para el rechazo',
        variant: 'destructive',
      });
      return;
    }
    rejectApplicationMutation.mutate({ application: selectedApplication, reason: rejectReason });
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'operador': return 'default';
      case 'vendedor_oficial': return 'default';
      case 'vendedor': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'inactive') {
      return <Badge variant="outline" className="border-destructive text-destructive">Inactivo</Badge>;
    }
    return <Badge variant="outline" className="border-green-600 text-green-600">Activo</Badge>;
  };

  const getIneUrl = async (inePath: string | null): Promise<string | null> => {
    if (!inePath) return null;
    const { data, error } = await supabase.storage
      .from('seller-documents')
      .createSignedUrl(inePath, 300); // 5-minute signed URL
    if (error) {
      console.error('Error generating signed URL for INE:', error);
      return null;
    }
    return data?.signedUrl ?? null;
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
        
        <Button className="btn-gold" onClick={() => setShowCreateDialog(true)}>
          <UserPlus size={18} className="mr-2" />
          Crear Usuario
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Clock size={16} />
            Solicitudes de Vendedor
            {pendingApplications && pendingApplications.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingApplications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users Table */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
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
                    <TableHead className="hidden md:table-cell">Fecha de Registro</TableHead>
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
                        <TableCell className="hidden md:table-cell">
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
                              
                              {/* Show "Ver Publicaciones" only for vendors */}
                              {userData.role === 'vendedor' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedVendor(userData);
                                      setShowVendorProductsDialog(true);
                                    }}
                                  >
                                    <Package size={16} className="mr-2" />
                                    Ver Publicaciones
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              <DropdownMenuSeparator />
                              {userData.status === 'inactive' ? (
                                <DropdownMenuItem
                                  onClick={() => handleReactivate(userData.user_id)}
                                >
                                  <CheckCircle size={16} className="mr-2 text-green-600" />
                                  Reactivar Acceso
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(userData);
                                    setShowDeactivateDialog(true);
                                  }}
                                >
                                  <Ban size={16} className="mr-2" />
                                  Desactivar Acceso
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedUser(userData);
                                  setShowDeleteDialog(true);
                                }}
                                disabled={userData.user_id === user?.id}
                              >
                                <Trash2 size={16} className="mr-2" />
                                Eliminar Cuenta
                              </DropdownMenuItem>
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
          </div>
        </TabsContent>

        {/* Seller Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          {applicationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingApplications?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle size={48} className="text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin solicitudes pendientes</h3>
                <p className="text-muted-foreground text-center">
                  Todas las solicitudes de vendedor han sido procesadas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingApplications?.map((application) => (
                <Card key={application.id} className="border-yellow-500/50 bg-yellow-500/5">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                          <Clock size={24} className="text-yellow-600" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg flex flex-wrap items-center gap-2">
                            <span className="truncate">{application.full_name}</span>
                            <Badge variant="outline" className="border-yellow-500 text-yellow-600 text-xs shrink-0">
                              Aprobación Requerida
                            </Badge>
                          </CardTitle>
                          <CardDescription className="truncate">{application.user_email}</CardDescription>
                        </div>
                      </div>
                      <Button 
                        className="w-full sm:w-auto shrink-0"
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationDialog(true);
                        }}
                      >
                        <Eye size={16} className="mr-2" />
                        Revisar Solicitud
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-muted-foreground" />
                        <span>Nacimiento: {new Date(application.birth_date).toLocaleDateString('es-MX')}</span>
                      </div>
                      {application.company_name && (
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-muted-foreground" />
                          <span>{application.company_name}</span>
                        </div>
                      )}
                      {application.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-muted-foreground" />
                          <span>{application.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-muted-foreground" />
                        <span>Solicitud: {new Date(application.created_at).toLocaleDateString('es-MX')}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Artículos a vender:</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{application.items_description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={20} className="text-primary" />
              Crear Nuevo Usuario
            </DialogTitle>
            <DialogDescription>
              Crea una cuenta con correo y contraseña para un nuevo colaborador.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo *</Label>
              <Input
                id="full_name"
                value={createFormData.full_name}
                onChange={(e) => setCreateFormData({ ...createFormData, full_name: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                value={createFormData.phone}
                onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={createFormData.role}
                onValueChange={(value) => setCreateFormData({ ...createFormData, role: value as AppRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="vendedor">Vendedor</SelectItem>
                   <SelectItem value="vendedor_oficial">Vendedor Oficial</SelectItem>
                   <SelectItem value="operador">Operador</SelectItem>
                   <SelectItem value="manejo">Manejo / Administrativo</SelectItem>
                   <SelectItem value="admin">Administrador</SelectItem>
                 </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {createFormData.role === 'admin' && 'Acceso completo al sistema'}
                {createFormData.role === 'operador' && 'Gestiona productos, pedidos y facturas'}
                {createFormData.role === 'vendedor_oficial' && 'Panel de ventas con leads, pedidos e inventario'}
                {createFormData.role === 'vendedor' && 'Solo puede gestionar sus propias publicaciones'}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="btn-gold" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Application Review Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Solicitud de Vendedor
            </DialogTitle>
            <DialogDescription>
              Revisa la información del solicitante antes de aprobar o rechazar.
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Nombre Completo</Label>
                  <p className="font-medium">{selectedApplication.full_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Correo Electrónico</Label>
                  <p className="font-medium">{selectedApplication.user_email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Fecha de Nacimiento</Label>
                  <p className="font-medium">
                    {new Date(selectedApplication.birth_date).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Teléfono</Label>
                  <p className="font-medium">{selectedApplication.phone || 'No proporcionado'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Empresa</Label>
                  <p className="font-medium">{selectedApplication.company_name || 'No proporcionado (Persona física)'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">RFC</Label>
                  <p className="font-medium">{selectedApplication.rfc || 'No proporcionado'}</p>
                </div>
              </div>

              {/* INE Document */}
              {selectedApplication.ine_url && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">INE (Identificación)</Label>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const url = await getIneUrl(selectedApplication.ine_url);
                        if (url) window.open(url, '_blank');
                      }}
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Ver documento INE
                    </Button>
                  </div>
                </div>
              )}

              {/* Items Description */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Descripción de Artículos a Vender</Label>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="whitespace-pre-wrap">{selectedApplication.items_description}</p>
                </div>
              </div>

              {/* Submission Date */}
              <div className="text-sm text-muted-foreground">
                Solicitud enviada el {new Date(selectedApplication.created_at).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowApplicationDialog(false)}>
              Cerrar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowRejectDialog(true)}
            >
              <X size={16} className="mr-2" />
              Rechazar
            </Button>
            <Button 
              className="btn-gold"
              onClick={handleApproveApplication}
              disabled={approveApplicationMutation.isPending}
            >
              {approveApplicationMutation.isPending ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <CheckCircle size={16} className="mr-2" />
              )}
              Aprobar Vendedor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Application Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar Solicitud</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor proporciona un motivo para el rechazo. El usuario será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Motivo del rechazo *</Label>
            <Textarea
              id="reject-reason"
              placeholder="Ej: La información proporcionada no es suficiente, falta documentación válida, etc."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectApplication}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={rejectApplicationMutation.isPending}
            >
              {rejectApplicationMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
              Rechazar Solicitud
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  <SelectItem value="vendedor_oficial">Vendedor Oficial</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="manejo">Manejo / Administrativo</SelectItem>
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
              {updateStatusMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">¿Eliminar cuenta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cuenta de <strong>{selectedUser?.full_name}</strong> ({selectedUser?.email}) será eliminada permanentemente junto con todos sus datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Vendor Products Dialog */}
      {selectedVendor && (
        <VendorProductsDialog
          open={showVendorProductsDialog}
          onOpenChange={(open) => {
            setShowVendorProductsDialog(open);
            if (!open) setSelectedVendor(null);
          }}
          vendorId={selectedVendor.user_id}
          vendorName={selectedVendor.full_name}
        />
      )}
    </div>
  );
};

export default AdminUsuarios;