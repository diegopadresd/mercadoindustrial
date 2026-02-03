import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
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
  Loader2,
  Eye,
  EyeOff,
  Send,
  CheckCircle,
  Clock,
  Gavel
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useProductImages } from '@/hooks/useProductImages';
import { useProductAI, ProductAIResult } from '@/hooks/useProductAI';

const AdminInventario = () => {
  const { user } = useAuth();
  const { isVendedor, isStaff, sellerId, permissions } = useUserRole();
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAIConfirmDialog, setShowAIConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showPublishRequestDialog, setShowPublishRequestDialog] = useState(false);
  const [productToRequest, setProductToRequest] = useState<any>(null);
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
    is_active: isVendedor ? false : true, // Vendors start with inactive (draft)
    is_featured: false,
    is_new: false,
    images: [] as string[],
    // Shipping fields
    peso_aprox_kg: '',
    largo_aprox_cm: '',
    ancho_aprox_cm: '',
    alto_aprox_cm: '',
    cp_origen: '',
    // Auction fields
    is_auction: false,
    auction_min_price: '',
    auction_start: '',
    auction_end: '',
    contact_for_quote: false,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', search, sellerId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Vendors only see their own products
      if (isVendedor && !isStaff && sellerId) {
        query = query.eq('seller_id', sellerId);
      }

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
      // Validation: Auction rules
      if (data.is_auction) {
        if (!data.auction_min_price || parseFloat(data.auction_min_price) <= 0) {
          throw new Error('Para subastas, el precio mínimo ("Compra ya") es obligatorio');
        }
        if (!data.auction_start) {
          throw new Error('La fecha de inicio de subasta es obligatoria');
        }
        if (!data.auction_end) {
          throw new Error('La fecha de fin de subasta es obligatoria');
        }
        const start = new Date(data.auction_start);
        const end = new Date(data.auction_end);
        if (end <= start) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (diffHours < 1) {
          throw new Error('La subasta debe durar al menos 1 hora');
        }
      } else {
        // Non-auction product validation
        if (!data.price && !data.contact_for_quote) {
          throw new Error('Debes asignar un precio o marcar "Contactar para cotización"');
        }
      }

      // Validation: if publishing (is_active=true), require shipping fields
      if (data.is_active) {
        const missingFields = [];
        if (!data.peso_aprox_kg) missingFields.push('Peso aproximado');
        if (!data.largo_aprox_cm) missingFields.push('Largo');
        if (!data.ancho_aprox_cm) missingFields.push('Ancho');
        if (!data.alto_aprox_cm) missingFields.push('Alto');
        if (!data.cp_origen) missingFields.push('CP origen');
        
        if (missingFields.length > 0) {
          throw new Error(`Para publicar, completa los datos de envío: ${missingFields.join(', ')}`);
        }
      }

      const productData: any = {
        id: data.id || data.sku,
        title: data.title,
        sku: data.sku,
        brand: data.brand,
        price: data.is_auction ? null : (data.price ? parseFloat(data.price) : null),
        stock: parseInt(data.stock) || 1,
        location: data.location,
        description: data.description,
        categories: data.categories.split(',').map(c => c.trim()).filter(Boolean),
        is_active: isVendedor && !isStaff ? false : data.is_active, // Vendors can't publish
        is_featured: data.is_featured,
        is_new: data.is_new,
        images: data.images,
        // Shipping fields
        peso_aprox_kg: data.peso_aprox_kg ? parseFloat(data.peso_aprox_kg) : null,
        largo_aprox_cm: data.largo_aprox_cm ? parseFloat(data.largo_aprox_cm) : null,
        ancho_aprox_cm: data.ancho_aprox_cm ? parseFloat(data.ancho_aprox_cm) : null,
        alto_aprox_cm: data.alto_aprox_cm ? parseFloat(data.alto_aprox_cm) : null,
        cp_origen: data.cp_origen || null,
        // Auction fields
        is_auction: data.is_auction,
        auction_min_price: data.is_auction && data.auction_min_price ? parseFloat(data.auction_min_price) : null,
        auction_start: data.is_auction && data.auction_start ? data.auction_start : null,
        auction_end: data.is_auction && data.auction_end ? data.auction_end : null,
        auction_status: data.is_auction ? 'scheduled' : 'inactive',
        contact_for_quote: !data.is_auction && data.contact_for_quote,
      };

      // Assign seller_id for vendors
      if (isVendedor && !editingProduct) {
        productData.seller_id = user?.id;
      }

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
        title: editingProduct ? 'Producto actualizado' : (isVendedor && !isStaff ? 'Borrador guardado' : 'Producto creado'),
        description: isVendedor && !isStaff && !editingProduct 
          ? 'Tu producto se guardó como borrador. Solicita publicación cuando esté listo.'
          : 'Los cambios se guardaron correctamente',
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

  // Toggle publish/unpublish mutation (for staff only)
  const togglePublishMutation = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: variables.isActive ? 'Producto publicado' : 'Producto despublicado',
        description: variables.isActive 
          ? 'El producto ahora es visible en el catálogo'
          : 'El producto ya no es visible en el catálogo',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el estado del producto',
        variant: 'destructive',
      });
    },
  });

  // Request publication mutation (for vendors)
  const requestPublicationMutation = useMutation({
    mutationFn: async (productId: string) => {
      // TODO: Implement publication request logic
      // For now, just notify - in a real app, you'd create a notification for admins
      // This could be a new table "publication_requests" or a notification system
      console.log('Publication requested for:', productId);
      return { productId };
    },
    onSuccess: () => {
      toast({
        title: 'Solicitud enviada',
        description: 'Tu solicitud de publicación ha sido enviada al administrador',
      });
      setShowPublishRequestDialog(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la solicitud',
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
      peso_aprox_kg: '',
      largo_aprox_cm: '',
      ancho_aprox_cm: '',
      alto_aprox_cm: '',
      cp_origen: '',
      // Auction fields
      is_auction: false,
      auction_min_price: '',
      auction_start: '',
      auction_end: '',
      contact_for_quote: false,
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
      peso_aprox_kg: product.peso_aprox_kg?.toString() || '',
      largo_aprox_cm: product.largo_aprox_cm?.toString() || '',
      ancho_aprox_cm: product.ancho_aprox_cm?.toString() || '',
      alto_aprox_cm: product.alto_aprox_cm?.toString() || '',
      cp_origen: product.cp_origen || '',
      // Auction fields
      is_auction: product.is_auction ?? false,
      auction_min_price: product.auction_min_price?.toString() || '',
      auction_start: product.auction_start ? new Date(product.auction_start).toISOString().slice(0, 16) : '',
      auction_end: product.auction_end ? new Date(product.auction_end).toISOString().slice(0, 16) : '',
      contact_for_quote: product.contact_for_quote ?? false,
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
            {isVendedor && !isStaff ? 'Mis Publicaciones' : 'Inventario'}
          </h1>
          <p className="text-muted-foreground">
            {products?.length || 0} {isVendedor && !isStaff ? 'publicaciones' : 'productos'} 
            {isVendedor && !isStaff ? '' : ' en inventario'}
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
                {isVendedor && !isStaff ? 'Nueva Publicación' : 'Agregar Producto'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct 
                    ? 'Editar Producto' 
                    : (isVendedor && !isStaff ? 'Nueva Publicación' : 'Agregar Producto')
                  }
                </DialogTitle>
                <DialogDescription>
                  {editingProduct 
                    ? 'Modifica los datos del producto' 
                    : (isVendedor && !isStaff 
                        ? 'Completa los datos. Tu publicación se guardará como borrador.' 
                        : 'Completa los datos del nuevo producto')
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Fotos del producto</Label>
                    {formData.images.length > 0 && (
                      <Button
                        type="button"
                        variant={identifying ? "outline" : "secondary"}
                        size="sm"
                        onClick={handleAIIdentify}
                        disabled={identifying}
                        className={`gap-2 transition-all ${!identifying ? 'hover:bg-primary hover:text-primary-foreground' : ''}`}
                      >
                        {identifying ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Sparkles size={16} />
                        )}
                        {identifying ? 'Identificando...' : 'Identificador AI'}
                      </Button>
                    )}
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

                  {/* Auction Toggle */}
                  <div className="col-span-2 border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="is_auction"
                          checked={formData.is_auction}
                          onCheckedChange={(checked) => setFormData({ 
                            ...formData, 
                            is_auction: checked,
                            // Clear price when enabling auction, clear auction fields when disabling
                            price: checked ? '' : formData.price,
                            auction_min_price: checked ? formData.auction_min_price : '',
                            auction_start: checked ? formData.auction_start : '',
                            auction_end: checked ? formData.auction_end : '',
                          })}
                        />
                        <Label htmlFor="is_auction" className="font-semibold">
                          🔨 Activar Subasta (Pujas)
                        </Label>
                      </div>
                    </div>

                    {formData.is_auction ? (
                      /* Auction Fields */
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="auction_min_price">
                            Precio mínimo / "Compra ya" (MXN) *
                          </Label>
                          <Input
                            id="auction_min_price"
                            type="number"
                            step="0.01"
                            min="1"
                            value={formData.auction_min_price}
                            onChange={(e) => setFormData({ ...formData, auction_min_price: e.target.value })}
                            placeholder="Ej: 150000"
                            required={formData.is_auction}
                          />
                          <p className="text-xs text-muted-foreground">
                            Este será el precio de "Compra ya" y el mínimo para validar la subasta.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="auction_start">Inicio de subasta *</Label>
                          <Input
                            id="auction_start"
                            type="datetime-local"
                            value={formData.auction_start}
                            onChange={(e) => setFormData({ ...formData, auction_start: e.target.value })}
                            required={formData.is_auction}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="auction_end">Fin de subasta *</Label>
                          <Input
                            id="auction_end"
                            type="datetime-local"
                            value={formData.auction_end}
                            onChange={(e) => setFormData({ ...formData, auction_end: e.target.value })}
                            min={formData.auction_start}
                            required={formData.is_auction}
                          />
                        </div>
                      </div>
                    ) : (
                      /* Normal Price Fields */
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Precio (MXN)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="Dejar vacío si requiere cotización"
                            disabled={formData.contact_for_quote}
                          />
                        </div>
                        <div className="flex items-end pb-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="contact_for_quote"
                              checked={formData.contact_for_quote}
                              onCheckedChange={(checked) => setFormData({ 
                                ...formData, 
                                contact_for_quote: checked,
                                price: checked ? '' : formData.price 
                              })}
                            />
                            <Label htmlFor="contact_for_quote" className="text-sm">
                              Contactar para cotización
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
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

                  {/* Shipping Data Section */}
                  <div className="col-span-2 border-t pt-4 mt-4">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Package size={18} className="text-primary" />
                      Datos de envío (requeridos para publicar)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso_aprox_kg">Peso (kg) *</Label>
                        <Input
                          id="peso_aprox_kg"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.peso_aprox_kg}
                          onChange={(e) => setFormData({ ...formData, peso_aprox_kg: e.target.value })}
                          placeholder="Ej: 150"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="largo_aprox_cm">Largo (cm) *</Label>
                        <Input
                          id="largo_aprox_cm"
                          type="number"
                          min="0"
                          value={formData.largo_aprox_cm}
                          onChange={(e) => setFormData({ ...formData, largo_aprox_cm: e.target.value })}
                          placeholder="Ej: 120"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ancho_aprox_cm">Ancho (cm) *</Label>
                        <Input
                          id="ancho_aprox_cm"
                          type="number"
                          min="0"
                          value={formData.ancho_aprox_cm}
                          onChange={(e) => setFormData({ ...formData, ancho_aprox_cm: e.target.value })}
                          placeholder="Ej: 100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alto_aprox_cm">Alto (cm) *</Label>
                        <Input
                          id="alto_aprox_cm"
                          type="number"
                          min="0"
                          value={formData.alto_aprox_cm}
                          onChange={(e) => setFormData({ ...formData, alto_aprox_cm: e.target.value })}
                          placeholder="Ej: 80"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cp_origen">CP origen *</Label>
                        <Input
                          id="cp_origen"
                          type="text"
                          maxLength={5}
                          value={formData.cp_origen}
                          onChange={(e) => setFormData({ ...formData, cp_origen: e.target.value.replace(/\D/g, '') })}
                          placeholder="Ej: 83000"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      * Estos datos son obligatorios para publicar el producto y permitir cotización de envío.
                    </p>
                  </div>

                  {/* Only show publish switches for staff */}
                  {isStaff && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Publicar (visible en catálogo)</Label>
                    </div>
                  )}

                  {isStaff && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                      />
                      <Label htmlFor="is_featured">Destacado</Label>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_new"
                      checked={formData.is_new}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                    />
                    <Label htmlFor="is_new">Nuevo</Label>
                  </div>
                </div>

                {/* Info for vendors */}
                {isVendedor && !isStaff && !editingProduct && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Nota:</strong> Tu publicación se guardará como borrador. Una vez que esté lista, 
                      podrás solicitar su publicación desde la lista de productos.
                    </p>
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="btn-gold" disabled={saveMutation.isPending}>
                    {saveMutation.isPending 
                      ? 'Guardando...' 
                      : (isVendedor && !isStaff && !editingProduct ? 'Guardar Borrador' : 'Guardar')
                    }
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (productToDelete) {
                  deleteMutation.mutate(productToDelete);
                  setProductToDelete(null);
                  setShowDeleteDialog(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request Publication Dialog (for vendors) */}
      <AlertDialog open={showPublishRequestDialog} onOpenChange={setShowPublishRequestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send size={20} className="text-primary" />
              Solicitar Publicación
            </AlertDialogTitle>
            <AlertDialogDescription>
              {productToRequest && (
                <div className="space-y-2 mt-2">
                  <p>¿Deseas solicitar la publicación de <strong>{productToRequest.title}</strong>?</p>
                  <p className="text-sm">Un administrador revisará tu producto y lo publicará si cumple con los requisitos.</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (productToRequest) {
                  requestPublicationMutation.mutate(productToRequest.id);
                  setProductToRequest(null);
                }
              }}
              className="btn-gold"
            >
              Enviar Solicitud
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
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-muted-foreground">Cargando productos...</p>
                </TableCell>
              </TableRow>
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Package className="mx-auto mb-2 text-muted-foreground/50" size={32} />
                  <p className="text-muted-foreground">
                    {isVendedor && !isStaff ? 'No tienes publicaciones aún' : 'No se encontraron productos'}
                  </p>
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
                      <Badge variant="secondary" className="text-xs">Cotizar</Badge>
                    )}
                  </TableCell>
                  <TableCell>{product.stock || 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.is_active ? (
                        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-500/10">
                          <CheckCircle size={12} className="mr-1" />
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10">
                          <Clock size={12} className="mr-1" />
                          Borrador
                        </Badge>
                      )}
                      {product.is_featured && (
                        <Badge variant="outline" className="border-primary text-primary bg-primary/10">
                          Destacado
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit size={16} className="mr-1" />
                          Acciones
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(product)}>
                          <Edit size={16} className="mr-2" />
                          Editar
                        </DropdownMenuItem>
                        
                        {/* Staff can publish/unpublish */}
                        {isStaff && (
                          <>
                            <DropdownMenuSeparator />
                            {product.is_active ? (
                              <DropdownMenuItem 
                                onClick={() => togglePublishMutation.mutate({ productId: product.id, isActive: false })}
                              >
                                <EyeOff size={16} className="mr-2" />
                                Despublicar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => togglePublishMutation.mutate({ productId: product.id, isActive: true })}
                              >
                                <Eye size={16} className="mr-2" />
                                Publicar
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        
                        {/* Vendors see "Request Publication" for drafts */}
                        {isVendedor && !isStaff && !product.is_active && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setProductToRequest(product);
                                setShowPublishRequestDialog(true);
                              }}
                            >
                              <Send size={16} className="mr-2" />
                              Solicitar Publicación
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setProductToDelete(product.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 size={16} className="mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
