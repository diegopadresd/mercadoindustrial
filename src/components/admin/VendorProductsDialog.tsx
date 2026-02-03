import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Loader2, 
  Trash2, 
  Edit, 
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VendorProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  vendorName: string;
}

interface Product {
  id: string;
  title: string;
  sku: string;
  price: number | null;
  images: string[];
  is_active: boolean;
  created_at: string;
}

export const VendorProductsDialog = ({
  open,
  onOpenChange,
  vendorId,
  vendorName,
}: VendorProductsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Fetch vendor's products
  const { data: products, isLoading } = useQuery({
    queryKey: ['vendor-products', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, sku, price, images, is_active, created_at')
        .eq('seller_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: open && !!vendorId,
  });

  // Toggle product active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products', vendorId] });
      toast({
        title: variables.isActive ? 'Producto activado' : 'Producto desactivado',
        description: variables.isActive 
          ? 'El producto ahora está visible en el catálogo'
          : 'El producto ha sido ocultado del catálogo',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del producto',
        variant: 'destructive',
      });
    },
  });

  // Delete product
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products', vendorId] });
      toast({
        title: 'Producto eliminado',
        description: 'El producto ha sido eliminado permanentemente',
      });
      setProductToDelete(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto',
        variant: 'destructive',
      });
    },
  });

  const handleToggleActive = (product: Product) => {
    toggleActiveMutation.mutate({ productId: product.id, isActive: !product.is_active });
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package size={20} className="text-primary" />
              Publicaciones de {vendorName}
            </DialogTitle>
            <DialogDescription>
              {products?.length || 0} productos publicados por este vendedor
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin publicaciones</h3>
              <p className="text-muted-foreground">
                Este vendedor aún no ha publicado ningún producto.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3">
                {products?.map((product) => (
                  <div
                    key={product.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      product.is_active 
                        ? 'bg-card border-border/50' 
                        : 'bg-muted/30 border-muted'
                    }`}
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{product.title}</h4>
                        {!product.is_active && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            <EyeOff size={12} className="mr-1" />
                            Oculto
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>SKU: {product.sku}</span>
                        {product.price && (
                          <span className="font-medium text-foreground">
                            ${product.price.toLocaleString('es-MX')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle Active */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        <Switch
                          checked={product.is_active}
                          onCheckedChange={() => handleToggleActive(product)}
                          disabled={toggleActiveMutation.isPending}
                        />
                      </div>

                      {/* View Product */}
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link to={`/producto/${product.id}`} target="_blank">
                          <ExternalLink size={16} />
                        </Link>
                      </Button>

                      {/* Edit Product */}
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link to={`/admin/inventario?edit=${product.id}`}>
                          <Edit size={16} />
                        </Link>
                      </Button>

                      {/* Delete Product */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setProductToDelete(product)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive" size={20} />
              ¿Eliminar producto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el producto "{productToDelete?.title}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProductMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={deleteProductMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProductMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
