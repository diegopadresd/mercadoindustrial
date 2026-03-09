import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Pause, 
  Play,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

const MisPublicaciones = () => {
  const { user } = useAuth();
  const { isVendedor } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['my-products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId)
        .eq('seller_id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      toast({ title: 'Producto actualizado' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar el producto', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      toast({ title: 'Producto eliminado' });
      setDeleteProductId(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo eliminar el producto', variant: 'destructive' });
    },
  });

  const canPublish = (product: any) => {
    return product.peso_aprox_kg && product.largo_aprox_cm && product.ancho_aprox_cm && 
           product.alto_aprox_cm && product.cp_origen;
  };

  const getStatusBadge = (product: any) => {
    if (product.is_auction && product.auction_status === 'active') {
      return <Badge className="bg-purple-500/20 text-purple-600">Subasta Activa</Badge>;
    }
    if (!product.is_active) {
      return <Badge variant="secondary">Pausado</Badge>;
    }
    if (!canPublish(product)) {
      return <Badge className="bg-yellow-500/20 text-yellow-600">Incompleto</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-600">Publicado</Badge>;
  };

  if (!isVendedor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <Package size={64} className="mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold mb-2">No eres vendedor aún</h1>
          <p className="text-muted-foreground mb-6">Activa tu cuenta de vendedor para publicar productos</p>
          <Link to="/mi-cuenta/vender">
            <Button className="btn-gold">Activar cuenta de vendedor</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/mi-cuenta">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold">Mis Publicaciones</h1>
              <p className="text-muted-foreground">Gestiona los productos que has publicado</p>
            </div>
            <Link to="/mi-cuenta/publicar">
              <Button className="btn-gold">
                <Plus size={18} className="mr-2" />
                Publicar Producto
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !products || products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-card rounded-xl border border-border"
            >
              <Package size={64} className="mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No tienes publicaciones</h2>
              <p className="text-muted-foreground mb-6">Empieza a vender publicando tu primer producto</p>
              <Link to="/mi-cuenta/publicar">
                <Button className="btn-gold">
                  <Plus size={18} className="mr-2" />
                  Publicar mi primer producto
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
                >
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{product.title}</h3>
                      {getStatusBadge(product)}
                    </div>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    <p className="text-sm font-semibold text-primary">
                      {product.price ? `$${product.price.toLocaleString('es-MX')} MXN` : 'Precio por cotizar'}
                    </p>
                  </div>
                  
                  {!canPublish(product) && (
                    <div className="hidden md:flex items-center gap-2 text-yellow-600 text-sm">
                      <AlertTriangle size={16} />
                      <span>Faltan datos de envío</span>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/mi-cuenta/publicar?edit=${product.id}`)}>
                        <Pencil size={16} className="mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {product.is_active ? (
                        <DropdownMenuItem 
                          onClick={() => toggleActiveMutation.mutate({ productId: product.id, isActive: false })}
                        >
                          <Pause size={16} className="mr-2" />
                          Pausar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => {
                            if ((product as any).approval_status === 'rejected' || (product as any).approval_status === 'pending') {
                              toast({ 
                                title: 'Aprobación requerida', 
                                description: 'Este producto está pendiente de revisión por el administrador.',
                                variant: 'destructive'
                              });
                            } else if (canPublish(product)) {
                              toggleActiveMutation.mutate({ productId: product.id, isActive: true });
                            } else {
                              toast({ 
                                title: 'Datos incompletos', 
                                description: 'Completa peso, dimensiones y CP origen para publicar',
                                variant: 'destructive'
                              });
                            }
                          }}
                        >
                          <Play size={16} className="mr-2" />
                          Publicar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setDeleteProductId(product.id)}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteProductId && deleteMutation.mutate(deleteProductId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default MisPublicaciones;
