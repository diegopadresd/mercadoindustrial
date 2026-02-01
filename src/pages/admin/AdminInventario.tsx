import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  Search,
  Plus,
  Edit,
  Trash2,
  ImageIcon,
  Upload,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
  DialogTrigger,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useProductImages } from '@/hooks/useProductImages';
import { useProductAI, ProductAIResult } from '@/hooks/useProductAI';

const AdminInventario = () => {
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAIConfirmDialog, setShowAIConfirmDialog] = useState(false);
  const [aiResult, setAIResult] = useState<ProductAIResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { uploading, uploadImage, deleteImage } = useProductImages();
  const { identifying, identifyProduct } = useProductAI();

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    sku: '',
    brand: '',
    price: '',
    stock: '1',
    location: '',
    description: '',
    categories: '',
    is_active: true,
    is_featured: false,
    is_new: false,
    images: [] as string[],
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const productData = {
        id: data.id || data.sku,
        title: data.title,
        sku: data.sku,
        brand: data.brand,
        price: data.price ? parseFloat(data.price) : null,
        stock: parseInt(data.stock) || 1,
        location: data.location,
        description: data.description,
        categories: data.categories.split(',').map(c => c.trim()).filter(Boolean),
        is_active: data.is_active,
        is_featured: data.is_featured,
        is_new: data.is_new,
        images: data.images,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: editingProduct ? 'Producto actualizado' : 'Producto creado',
        description: 'Los cambios se guardaron correctamente',
      });
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el producto',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: 'Producto eliminado',
        description: 'El producto se eliminó correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      sku: '',
      brand: '',
      price: '',
      stock: '1',
      location: '',
      description: '',
      categories: '',
      is_active: true,
      is_featured: false,
      is_new: false,
      images: [],
    });
    setEditingProduct(null);
    setAIResult(null);
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      title: product.title,
      sku: product.sku,
      brand: product.brand,
      price: product.price?.toString() || '',
      stock: product.stock?.toString() || '1',
      location: product.location || '',
      description: product.description || '',
      categories: product.categories?.join(', ') || '',
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      is_new: product.is_new ?? false,
      images: product.images || [],
    });
    setShowAddDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, url],
        }));
      }
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    await deleteImage(imageUrl);
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl),
    }));
  };

  const handleAIIdentify = async () => {
    if (formData.images.length === 0) {
      toast({
        title: 'Sin imagen',
        description: 'Primero sube una imagen del producto para identificarlo',
        variant: 'destructive',
      });
      return;
    }

    const result = await identifyProduct(formData.images[0], products || []);
    
    if (result && result.identified) {
      setAIResult(result);
      setShowAIConfirmDialog(true);
    } else {
      toast({
        title: 'No identificado',
        description: result?.notes || 'No se pudo identificar el producto en la imagen',
        variant: 'destructive',
      });
    }
  };

  const applyAIResult = () => {
    if (!aiResult) return;
    
    setFormData(prev => ({
      ...prev,
      title: aiResult.title || prev.title,
      sku: aiResult.sku || prev.sku,
      brand: aiResult.brand || prev.brand,
      price: aiResult.price?.toString() || prev.price,
      categories: aiResult.categories?.join(', ') || prev.categories,
      description: aiResult.description || prev.description,
    }));
    
    setShowAIConfirmDialog(false);
    toast({
      title: 'Información aplicada',
      description: `Producto identificado con confianza ${aiResult.confidence}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Inventario
          </h1>
          <p className="text-muted-foreground">
            {products?.length || 0} productos en inventario
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar por título, SKU o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Add Button */}
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="btn-gold" onClick={resetForm}>
                <Plus size={18} className="mr-2" />
                Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Modifica los datos del producto' : 'Completa los datos del nuevo producto'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Fotos del producto</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAIIdentify}
                      disabled={identifying || formData.images.length === 0}
                      className="gap-2"
                    >
                      {identifying ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      {identifying ? 'Identificando...' : 'Identificador AI'}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Image previews */}
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img src={img} alt={`Producto ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {/* Upload button */}
                    <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-muted/30">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <Loader2 size={24} className="text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <Upload size={24} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground text-center px-2">Subir foto</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (dejar vacío para cotizar)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ej: Hermosillo, Sonora"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="categories">Categorías (separadas por coma)</Label>
                    <Input
                      id="categories"
                      value={formData.categories}
                      onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                      placeholder="Ej: Maquinaria pesada, Bulldozer"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Activo</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="is_featured">Destacado</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_new"
                      checked={formData.is_new}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                    />
                    <Label htmlFor="is_new">Nuevo</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="btn-gold" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Confirmation Dialog */}
      <AlertDialog open={showAIConfirmDialog} onOpenChange={setShowAIConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" size={20} />
              Producto identificado
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>El AI ha identificado el producto con los siguientes datos:</p>
                {aiResult && (
                  <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                    <p><strong>Título:</strong> {aiResult.title}</p>
                    <p><strong>SKU:</strong> {aiResult.sku}</p>
                    <p><strong>Marca:</strong> {aiResult.brand}</p>
                    <p><strong>Precio sugerido:</strong> ${aiResult.price?.toLocaleString('es-MX')}</p>
                    <p><strong>Categorías:</strong> {aiResult.categories?.join(', ')}</p>
                    <p><strong>Confianza:</strong> <span className={`font-medium ${
                      aiResult.confidence === 'alta' ? 'text-green-600' :
                      aiResult.confidence === 'media' ? 'text-yellow-600' : 'text-red-600'
                    }`}>{aiResult.confidence}</span></p>
                    {aiResult.notes && <p className="text-muted-foreground italic">{aiResult.notes}</p>}
                  </div>
                )}
                <p>¿Deseas aplicar esta información al formulario?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={applyAIResult} className="btn-gold">
              Aplicar información
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Products Table */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Package className="mx-auto mb-2 text-muted-foreground/50" size={32} />
                  <p className="text-muted-foreground">No se encontraron productos</p>
                </TableCell>
              </TableRow>
            ) : (
              products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <ImageIcon size={18} className="text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium line-clamp-1">{product.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.categories?.join(', ')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{product.sku}</span>
                  </TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>
                    {product.price ? (
                      <span className="font-semibold">
                        ${Number(product.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-secondary text-sm">Cotizar</span>
                    )}
                  </TableCell>
                  <TableCell>{product.stock || 1}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {product.is_active ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-600">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-600">
                          Inactivo
                        </span>
                      )}
                      {product.is_featured && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          Destacado
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Eliminar este producto?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminInventario;
