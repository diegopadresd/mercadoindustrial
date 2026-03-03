import { useState, useEffect } from 'react';
import { Settings, Bell, Loader2, Save, AlertCircle, Star, Plus, Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useUserRole } from '@/hooks/useUserRole';
import AccessDenied from '@/components/admin/AccessDenied';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ======================== FEATURED PRODUCTS ========================
interface FeaturedProduct {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  brand: string | null;
  link: string | null;
  price: number | null;
  display_order: number | null;
  is_active: boolean | null;
}

const emptyProduct: Omit<FeaturedProduct, 'id'> = {
  title: '',
  description: '',
  image_url: '',
  category: '',
  brand: '',
  link: '',
  price: null,
  display_order: 0,
  is_active: true,
};

const FeaturedProductsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FeaturedProduct | null>(null);
  const [form, setForm] = useState<Omit<FeaturedProduct, 'id'>>(emptyProduct);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_products')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as FeaturedProduct[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { id?: string; values: Omit<FeaturedProduct, 'id'> }) => {
      if (data.id) {
        const { error } = await supabase
          .from('featured_products')
          .update({ ...data.values, updated_at: new Date().toISOString() })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('featured_products')
          .insert([{ ...data.values }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast({ title: editingProduct ? 'Producto actualizado' : 'Producto agregado', description: 'Los cambios se guardaron correctamente.' });
      setDialogOpen(false);
      setEditingProduct(null);
      setForm(emptyProduct);
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo guardar el producto', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('featured_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast({ title: 'Producto eliminado' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo eliminar el producto', variant: 'destructive' });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('featured_products')
        .update({ display_order: newOrder })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-products'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('featured_products').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
    },
  });

  const handleEdit = (product: FeaturedProduct) => {
    setEditingProduct(product);
    setForm({
      title: product.title,
      description: product.description || '',
      image_url: product.image_url || '',
      category: product.category || '',
      brand: product.brand || '',
      link: product.link || '',
      price: product.price,
      display_order: product.display_order ?? 0,
      is_active: product.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setForm({ ...emptyProduct, display_order: products.length });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast({ title: 'El título es obligatorio', variant: 'destructive' });
      return;
    }
    saveMutation.mutate({ id: editingProduct?.id, values: form });
  };

  const handleMoveUp = (product: FeaturedProduct, index: number) => {
    if (index === 0) return;
    const prev = products[index - 1];
    reorderMutation.mutate({ id: product.id, newOrder: prev.display_order ?? index - 1 });
    reorderMutation.mutate({ id: prev.id, newOrder: product.display_order ?? index });
  };

  const handleMoveDown = (product: FeaturedProduct, index: number) => {
    if (index === products.length - 1) return;
    const next = products[index + 1];
    reorderMutation.mutate({ id: product.id, newOrder: next.display_order ?? index + 1 });
    reorderMutation.mutate({ id: next.id, newOrder: product.display_order ?? index });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{products.length} producto(s) destacados configurados</p>
        </div>
        <Button onClick={handleNew} className="btn-gold">
          <Plus size={16} className="mr-2" />
          Agregar producto
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay productos destacados. Agrega el primero.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`flex items-center gap-4 p-4 rounded-xl border border-border bg-card transition-opacity ${!product.is_active ? 'opacity-50' : ''}`}
            >
              {/* Image */}
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <Image size={20} className="text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{product.title}</p>
                <p className="text-xs text-muted-foreground">
                  {[product.brand, product.category].filter(Boolean).join(' · ')}
                  {product.price ? ` · $${Number(product.price).toLocaleString('es-MX')}` : ''}
                </p>
                {product.link && (
                  <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                    <ExternalLink size={10} /> Ver enlace
                  </a>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <Switch
                  checked={product.is_active ?? true}
                  onCheckedChange={(val) => toggleActiveMutation.mutate({ id: product.id, is_active: val })}
                  title={product.is_active ? 'Desactivar' : 'Activar'}
                />
                <Button variant="ghost" size="icon" onClick={() => handleMoveUp(product, index)} disabled={index === 0} className="h-8 w-8">
                  <ArrowUp size={14} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleMoveDown(product, index)} disabled={index === products.length - 1} className="h-8 w-8">
                  <ArrowDown size={14} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8">
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(product.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar producto destacado' : 'Agregar producto destacado'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fp-title">Título *</Label>
              <Input id="fp-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nombre del producto" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-desc">Descripción</Label>
              <Textarea id="fp-desc" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción breve" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fp-brand">Marca</Label>
                <Input id="fp-brand" value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Ej: CATERPILLAR" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fp-category">Categoría</Label>
                <Input id="fp-category" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ej: Maquinaria" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fp-price">Precio (opcional)</Label>
                <Input id="fp-price" type="number" step="0.01" min="0" value={form.price ?? ''} onChange={e => setForm(f => ({ ...f, price: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fp-order">Orden</Label>
                <Input id="fp-order" type="number" min="0" value={form.display_order ?? 0} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-image">URL de imagen</Label>
              <Input id="fp-image" value={form.image_url || ''} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-link">Enlace al producto</Label>
              <Input id="fp-link" value={form.link || ''} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/productos/... o URL externa" />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="fp-active" checked={form.is_active ?? true} onCheckedChange={val => setForm(f => ({ ...f, is_active: val }))} />
              <Label htmlFor="fp-active">Activo (visible en el sitio)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="btn-gold" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ======================== MAIN PAGE ========================
const AdminAjustes = () => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { 
    announcementSettings, 
    isLoading: settingsLoading, 
    updateAnnouncement, 
    isUpdating 
  } = useSiteSettings();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (announcementSettings) {
      setEnabled(announcementSettings.enabled);
      setText(announcementSettings.text || '');
    }
  }, [announcementSettings]);

  const handleSave = () => {
    if (enabled && (!text || text.trim().length < 5)) {
      setValidationError('El texto del anuncio es obligatorio (mínimo 5 caracteres).');
      return;
    }
    setValidationError('');

    updateAnnouncement(
      { enabled, text: text.trim() },
      {
        onSuccess: () => {
          toast({
            title: 'Guardado correctamente',
            description: 'La configuración del anuncio ha sido actualizada.',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Error al guardar',
            description: error.message || 'No se pudo guardar la configuración.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (roleLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied message="Solo los administradores pueden acceder a los ajustes del sistema." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2">
          <Settings className="text-primary" />
          Ajustes
        </h1>
        <p className="text-muted-foreground">
          Configuración general del sitio
        </p>
      </div>

      <Tabs defaultValue="announcement">
        <TabsList className="mb-6">
          <TabsTrigger value="announcement">
            <Bell size={15} className="mr-2" />
            Anuncio
          </TabsTrigger>
          <TabsTrigger value="featured">
            <Star size={15} className="mr-2" />
            Productos Destacados
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Announcement */}
        <TabsContent value="announcement">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Anuncio de bienvenida
              </CardTitle>
              <CardDescription>
                Configura un anuncio emergente que aparecerá a todos los visitantes al entrar al sitio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="announcement-toggle" className="text-base font-medium">
                    Activar anuncio al entrar
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Cuando está activo, el anuncio aparecerá como un overlay al visitar el sitio.
                  </p>
                </div>
                <Switch
                  id="announcement-toggle"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcement-text">Texto del anuncio</Label>
                <Textarea
                  id="announcement-text"
                  placeholder="Escribe el mensaje que verán los visitantes..."
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  rows={4}
                  className={validationError ? 'border-destructive' : ''}
                />
                {validationError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {text.length} caracteres
                </p>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={isUpdating}
                className="btn-gold"
              >
                {isUpdating ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Guardar cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Featured Products */}
        <TabsContent value="featured">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={20} className="text-primary" />
                Productos Destacados
              </CardTitle>
              <CardDescription>
                Gestiona los productos que aparecen en la sección de maquinaria destacada en la página principal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeaturedProductsTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAjustes;
