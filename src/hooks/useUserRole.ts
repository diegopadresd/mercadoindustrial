import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'operador' | 'vendedor' | 'user';

export interface UserRoleInfo {
  role: AppRole;
  isAdmin: boolean;
  isOperador: boolean;
  isVendedor: boolean;
  isStaff: boolean; // admin or operador
  sellerId: string | null;
  companyId: string | null;
  isLoading: boolean;
}

export interface RolePermissions {
  canViewUsers: boolean;
  canManageUsers: boolean;
  canInviteUsers: boolean;
  canViewAllProducts: boolean;
  canPublishProducts: boolean;
  canViewOrders: boolean;
  canViewAllOrders: boolean;
  canViewInvoices: boolean;
  canViewQuestions: boolean;
  canViewOffers: boolean;
  canViewClients: boolean;
  canViewConfig: boolean;
}

export const getRolePermissions = (role: AppRole): RolePermissions => {
  switch (role) {
    case 'admin':
      return {
        canViewUsers: true,
        canManageUsers: true,
        canInviteUsers: true,
        canViewAllProducts: true,
        canPublishProducts: true,
        canViewOrders: true,
        canViewAllOrders: true,
        canViewInvoices: true,
        canViewQuestions: true,
        canViewOffers: true,
        canViewClients: true,
        canViewConfig: true,
      };
    case 'operador':
      return {
        canViewUsers: false,
        canManageUsers: false,
        canInviteUsers: false,
        canViewAllProducts: true,
        canPublishProducts: true,
        canViewOrders: true,
        canViewAllOrders: true,
        canViewInvoices: true,
        canViewQuestions: true,
        canViewOffers: true,
        canViewClients: false,
        canViewConfig: false,
      };
    case 'vendedor':
      return {
        canViewUsers: false,
        canManageUsers: false,
        canInviteUsers: false,
        canViewAllProducts: false,
        canPublishProducts: false,
        canViewOrders: true,
        canViewAllOrders: false,
        canViewInvoices: false,
        canViewQuestions: false,
        canViewOffers: true,
        canViewClients: false,
        canViewConfig: false,
      };
    default:
      return {
        canViewUsers: false,
        canManageUsers: false,
        canInviteUsers: false,
        canViewAllProducts: false,
        canPublishProducts: false,
        canViewOrders: false,
        canViewAllOrders: false,
        canViewInvoices: false,
        canViewQuestions: false,
        canViewOffers: false,
        canViewClients: false,
        canViewConfig: false,
      };
  }
};

export const getRoleLabel = (role: AppRole): string => {
  const labels: Record<AppRole, string> = {
    admin: 'Administrador',
    operador: 'Operador',
    vendedor: 'Vendedor',
    user: 'Usuario',
  };
  return labels[role] || role;
};

export const useUserRole = (): UserRoleInfo & { permissions: RolePermissions } => {
  const { user, isLoading: authLoading } = useAuth();
  const [roleData, setRoleData] = useState<{
    role: AppRole;
    sellerId: string | null;
    companyId: string | null;
  }>({
    role: 'user',
    sellerId: null,
    companyId: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRoleData({ role: 'user', sellerId: null, companyId: null });
        setIsLoading(false);
        return;
      }

      try {
        // Fetch role from user_roles table - prioritize highest role
        const { data: roles, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (roleError) {
          console.error('Error fetching user role:', roleError);
        }

        // Determine the highest priority role
        let highestRole: AppRole = 'user';
        if (roles && roles.length > 0) {
          const roleHierarchy: AppRole[] = ['admin', 'operador', 'vendedor', 'user'];
          for (const r of roleHierarchy) {
            if (roles.some(ur => ur.role === r)) {
              highestRole = r;
              break;
            }
          }
        }

        // Fetch profile for company_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        setRoleData({
          role: highestRole,
          sellerId: highestRole === 'vendedor' ? user.id : null,
          companyId: profile?.company_id || null,
        });
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserRole();
    }
  }, [user, authLoading]);

  const role = roleData.role;
  const permissions = getRolePermissions(role);

  return {
    role,
    isAdmin: role === 'admin',
    isOperador: role === 'operador',
    isVendedor: role === 'vendedor',
    isStaff: role === 'admin' || role === 'operador',
    sellerId: roleData.sellerId,
    companyId: roleData.companyId,
    isLoading: isLoading || authLoading,
    permissions,
  };
};
