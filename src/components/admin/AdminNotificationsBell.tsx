import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Bell, ShoppingCart, Tag, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationItem {
  id: string;
  type: 'order' | 'offer' | 'ticket';
  title: string;
  description: string;
  time: string;
  path: string;
}

const AdminNotificationsBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Fetch recent pending orders
  const { data: pendingOrders } = useQuery({
    queryKey: ['admin-pending-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, created_at, total')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  // Fetch recent pending offers
  const { data: pendingOffers } = useQuery({
    queryKey: ['admin-pending-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('id, customer_name, offer_price, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  // Fetch recent open support tickets
  const { data: openTickets } = useQuery({
    queryKey: ['admin-open-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('id, ticket_number, subject, created_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    return `hace ${diffDays}d`;
  };

  // Build notifications list
  const notifications: NotificationItem[] = [
    ...(pendingOrders?.map(order => ({
      id: `order-${order.id}`,
      type: 'order' as const,
      title: `Pedido ${order.order_number}`,
      description: `$${Number(order.total).toLocaleString('es-MX')} MXN - Pendiente`,
      time: formatTimeAgo(order.created_at),
      path: '/admin/pedidos',
    })) || []),
    ...(pendingOffers?.map(offer => ({
      id: `offer-${offer.id}`,
      type: 'offer' as const,
      title: `Oferta de ${offer.customer_name}`,
      description: `$${Number(offer.offer_price).toLocaleString('es-MX')} MXN`,
      time: formatTimeAgo(offer.created_at),
      path: '/admin/ofertas',
    })) || []),
    ...(openTickets?.map(ticket => ({
      id: `ticket-${ticket.id}`,
      type: 'ticket' as const,
      title: ticket.ticket_number,
      description: ticket.subject.substring(0, 40) + (ticket.subject.length > 40 ? '...' : ''),
      time: formatTimeAgo(ticket.created_at),
      path: '/admin/soporte',
    })) || []),
  ].sort((a, b) => {
    // Sort by most recent (compare time strings)
    return 0; // Keep insertion order since they're already sorted
  }).slice(0, 10);

  const totalCount = (pendingOrders?.length || 0) + (pendingOffers?.length || 0) + (openTickets?.length || 0);

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order': return <ShoppingCart size={14} className="text-blue-500" />;
      case 'offer': return <Tag size={14} className="text-amber-500" />;
      case 'ticket': return <Ticket size={14} className="text-purple-500" />;
    }
  };

  const handleItemClick = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          title="Notificaciones del panel"
        >
          <Bell size={20} />
          {totalCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-popover border border-border shadow-lg z-50" align="end">
        <div className="p-3 border-b border-border bg-popover">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-popover-foreground">Notificaciones</h4>
            {totalCount > 0 && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {totalCount} pendientes
              </Badge>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[280px] bg-popover">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No hay notificaciones pendientes</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.path)}
                  className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded-lg bg-muted shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-medium truncate text-popover-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t border-border bg-muted/50">
          <div className="grid grid-cols-3 gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={() => handleItemClick('/admin/pedidos')}
            >
              <ShoppingCart size={12} className="mr-1" />
              {pendingOrders?.length || 0}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={() => handleItemClick('/admin/ofertas')}
            >
              <Tag size={12} className="mr-1" />
              {pendingOffers?.length || 0}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={() => handleItemClick('/admin/soporte')}
            >
              <Ticket size={12} className="mr-1" />
              {openTickets?.length || 0}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdminNotificationsBell;
