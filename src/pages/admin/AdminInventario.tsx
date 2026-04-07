import { useState, useRef, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useCategories } from '@/hooks/useProducts';
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
  Gavel,
  Filter,
  DollarSign,
  MapPin,
  ChevronLeft,
  ChevronRight,
  History,
  TrendingUp,
  Check,
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
import { useProductAI, ProductAIResult, PriceComparison } from '@/hooks/useProductAI';
import { useProductHistory } from '@/hooks/useProductHistory';
import ProductHistoryDialog from '@/components/admin/ProductHistoryDialog';

const AdminInventario = () => {
  const { user } = useAuth();
  const { isVendedor, isStaff, isAdmin, sellerId, permissions } = useUserRole();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft'>('all');
  const [filterPrice, setFilterPrice] = useState<'all' | 'with_price' | 'no_price'>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAIConfirmDialog, setShowAIConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showPublishRequestDialog, setShowPublishRequestDialog] = useState(false);
  const [productToRequest, setProductToRequest] = useState<any>(null);
  const [aiResult, setAIResult] = useState<ProductAIResult | null>(null);
  const [priceComparison, setPriceComparison] = useState<PriceComparison | null>(null);
  const [manualProductName, setManualProductName] = useState('');
  const [isReidentifying, setIsReidentifying] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reasonContext, setReasonContext] = useState<{ type: string; prev: string; next: string } | null>(null);
  const [changeReason, setChangeReason] = useState('');
  const [pendingSaveData, setPendingSaveData] = useState<any>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyProductId, setHistoryProductId] = useState('');
  const [historyProductTitle, setHistoryProductTitle] = useState('');
  // Category picker state
  const [categoryInput, setCategoryInput] = useState('');
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { uploading, uploadImage, deleteImage } = useProductImages();
  const { identifying, comparingPrices, identifyProduct, comparePrices } = useProductAI();
  const { addEntry } = useProductHistory();
  const { data: existingCategories } = useCategories();

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    sku: '',
    brand: '',
    price: '',
    stock: '1',
    location: '',
    description: '',
    categories: [] as string[],
    is_active: isVendedor ? false : true,
    is_featured: false,
    is_new: false,
    images: [] as string[],
    peso_aprox_kg: '',
    largo_aprox_cm: '',
    ancho_aprox_cm: '',
    alto_aprox_cm: '',
    cp_origen: '',
    is_auction: false,
    auction_min_price: '',
    auction_start: '',
    auction_end: '',
    contact_for_quote: false,
    allow_offers: false,
  });

  // Filter categories for dropdown
  const filteredCategories = useMemo(() => {
    if (!existingCategories || !categoryInput.trim()) return existingCategories || [];
    return existingCategories.filter(c => 
      c.toLowerCase().includes(categoryInput.toLowerCase()) &&
      !formData.categories.includes(c)
    );
  }, [existingCategories, categoryInput, formData.categories]);

  // Get total count with same filters as product query
  const { data: totalCount } = useQuery({
    queryKey: ['admin-products-count', sellerId, isVendedor, isStaff, search, filterStatus, filterPrice, filterLocation],
    queryFn: async () => {
      let query = supabase.from('products').select('*', { count: 'exact', head: true });
      if (isVendedor && !isStaff && sellerId) {
        query = query.eq('seller_id', sellerId);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`);
      }
      if (filterStatus === 'active') query = query.eq('is_active', true);
      if (filterStatus === 'draft') query = query.eq('is_active', false);
      if (filterPrice === 'with_price') query = query.not('price', 'is', null).gt('price', 0);
      if (filterPrice === 'no_price') query = query.or('price.is.null,price.eq.0');
      if (filterLocation !== 'all') {
        if (filterLocation === 'none') {
          query = query.is('location', null);
        } else {
          query = query.eq('location', filterLocation);
        }
      }
      const { count } = await query;
      return count || 0;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', search, sellerId, filterStatus, filterPrice, filterLocation, page],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (isVendedor && !isStaff && sellerId) {
        query = query.eq('seller_id', sellerId);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`);
      }
      if (filterStatus === 'active') query = query.eq('is_active', true);
      if (filterStatus === 'draft') query = query.eq('is_active', false);
      if (filterPrice === 'with_price') query = query.not('price', 'is', null).gt('price', 0);
      if (filterPrice === 'no_price') query = query.or('price.is.null,price.eq.0');
      if (filterLocation !== 'all') {
        if (filterLocation === 'none') {
          query = query.is('location', null);
        } else {
          query = query.eq('location', filterLocation);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (data.is_auction) {
        if (!data.auction_min_price || parseFloat(data.auction_min_price) <= 0) {
          throw new Error('Para subastas, el precio mínimo ("Compra ya") es obligatorio');
        }
        if (!data.auction_start) throw new Error('La fecha de inicio de subasta es obligatoria');
        if (!data.auction_end) throw new Error('La fecha de fin de subasta es obligatoria');
        const start = new Date(data.auction_start);
        const end = new Date(data.auction_end);
        if (end <= start) throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        if ((end.getTime() - start.getTime()) / (1000 * 60 * 60) < 1) throw new Error('La subasta debe durar al menos 1 hora');
      } else {
        if (!data.price && !data.contact_for_quote) {
          throw new Error('Debes asignar un precio o marcar "Contactar para cotización"');
        }
      }

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
        categories: data.categories,
        is_active: isAdmin ? data.is_active : (!editingProduct ? false : data.is_active),
        is_featured: data.is_featured,
        is_new: data.is_new,
        images: data.images,
        peso_aprox_kg: data.peso_aprox_kg ? parseFloat(data.peso_aprox_kg) : null,
        largo_aprox_cm: data.largo_aprox_cm ? parseFloat(data.largo_aprox_cm) : null,
        ancho_aprox_cm: data.ancho_aprox_cm ? parseFloat(data.ancho_aprox_cm) : null,
        alto_aprox_cm: data.alto_aprox_cm ? parseFloat(data.alto_aprox_cm) : null,
        cp_origen: data.cp_origen || null,
        is_auction: data.is_auction,
        auction_min_price: data.is_auction && data.auction_min_price ? parseFloat(data.auction_min_price) : null,
        auction_start: data.is_auction && data.auction_start ? data.auction_start : null,
        auction_end: data.is_auction && data.auction_end ? data.auction_end : null,
        auction_status: data.is_auction ? 'scheduled' : 'inactive',
        contact_for_quote: !data.is_auction && data.contact_for_quote,
        allow_offers: data.allow_offers,
        ...(!isAdmin && !editingProduct ? { approval_status: 'draft' } : {}),
      };

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
        
        // Log creation in history
        if (user) {
          try {
            await supabase.from('product_history').insert({
              product_id: productData.id,
              user_id: user.id,
              event_type: 'created',
              new_value: productData.title,
            });
          } catch (e) { console.error('History log error:', e); }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: editingProduct ? 'Producto actualizado' : (!isAdmin ? 'Borrador guardado' : 'Producto creado'),
        description: !isAdmin && !editingProduct 
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
      toast({ title: 'Error', description: 'No se pudo cambiar el estado del producto', variant: 'destructive' });
    },
  });

  const requestPublicationMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .update({ approval_status: 'pending_approval' })
        .eq('id', productId);
      if (error) throw error;

      const { data: admins } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      if (admins?.length) {
        const notifications = admins.map(admin => ({
          user_id: admin.user_id,
          type: 'product_approval',
          title: 'Solicitud de publicación',
          message: `Un vendedor solicita aprobación para publicar un producto`,
          action_url: '/admin/inventario',
        }));
        await supabase.from('notifications').insert(notifications);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Solicitud enviada', description: 'Tu solicitud de publicación ha sido enviada al administrador para revisión' });
      setShowPublishRequestDialog(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo enviar la solicitud', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Producto eliminado', description: 'El producto se eliminó correctamente' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo eliminar el producto', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      id: '', title: '', sku: '', brand: '', price: '', stock: '1', location: '',
      description: '', categories: [], is_active: true, is_featured: false, is_new: false,
      images: [], peso_aprox_kg: '', largo_aprox_cm: '', ancho_aprox_cm: '', alto_aprox_cm: '',
      cp_origen: '', is_auction: false, auction_min_price: '', auction_start: '', auction_end: '',
      contact_for_quote: false, allow_offers: false,
    });
    setEditingProduct(null);
    setAIResult(null);
    setPriceComparison(null);
    setManualProductName('');
    setCategoryInput('');
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
      categories: product.categories || [],
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      is_new: product.is_new ?? false,
      images: product.images || [],
      peso_aprox_kg: product.peso_aprox_kg?.toString() || '',
      largo_aprox_cm: product.largo_aprox_cm?.toString() || '',
      ancho_aprox_cm: product.ancho_aprox_cm?.toString() || '',
      alto_aprox_cm: product.alto_aprox_cm?.toString() || '',
      cp_origen: product.cp_origen || '',
      is_auction: product.is_auction ?? false,
      auction_min_price: product.auction_min_price?.toString() || '',
      auction_start: product.auction_start ? new Date(product.auction_start).toISOString().slice(0, 16) : '',
      auction_end: product.auction_end ? new Date(product.auction_end).toISOString().slice(0, 16) : '',
      contact_for_quote: product.contact_for_quote ?? false,
      allow_offers: product.allow_offers ?? false,
    });
    setShowAddDialog(true);
  };

  // Detect changes and prompt for reason before saving
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct && user) {
      const oldStock = parseInt(editingProduct.stock?.toString() || '1');
      const newStock = parseInt(formData.stock) || 1;
      const oldLocation = editingProduct.location || '';
      const newLocation = formData.location || '';

      if (newStock !== oldStock) {
        setReasonContext({
          type: newStock < oldStock ? 'stock_decrease' : 'stock_increase',
          prev: oldStock.toString(),
          next: newStock.toString(),
        });
        setPendingSaveData(formData);
        setShowReasonDialog(true);
        return;
      }

      if (newLocation !== oldLocation) {
        setReasonContext({
          type: 'location_change',
          prev: oldLocation || 'Sin ubicación',
          next: newLocation || 'Sin ubicación',
        });
        setPendingSaveData(formData);
        setShowReasonDialog(true);
        return;
      }

      // Check price changes
      const oldPrice = editingProduct.price?.toString() || '';
      const newPrice = formData.price;
      if (oldPrice !== newPrice) {
        // Log price change without asking reason
        saveMutation.mutate(formData, {
          onSuccess: () => {
            supabase.from('product_history').insert({
              product_id: editingProduct.id,
              user_id: user.id,
              event_type: 'price_change',
              previous_value: oldPrice ? `$${Number(oldPrice).toLocaleString('es-MX')}` : 'Sin precio',
              new_value: newPrice ? `$${Number(newPrice).toLocaleString('es-MX')}` : 'Sin precio',
            }).then(() => {});
          },
        });
        return;
      }
    }
    
    saveMutation.mutate(formData);
  };

  const handleSaveWithReason = async () => {
    if (!pendingSaveData || !reasonContext || !user || !editingProduct) return;
    
    saveMutation.mutate(pendingSaveData, {
      onSuccess: () => {
        supabase.from('product_history').insert({
          product_id: editingProduct.id,
          user_id: user.id,
          event_type: reasonContext.type,
          previous_value: reasonContext.prev,
          new_value: reasonContext.next,
          reason: changeReason || undefined,
        }).then(() => {});
      },
    });
    
    setShowReasonDialog(false);
    setChangeReason('');
    setReasonContext(null);
    setPendingSaveData(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) {
        setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = async (imageUrl: string) => {
    await deleteImage(imageUrl);
    setFormData(prev => ({ ...prev, images: prev.images.filter(img => img !== imageUrl) }));
  };

  // Enhanced AI flow: name-first or image identification
  const handleAIIdentify = async () => {
    // If title exists, skip image identification — go straight to price comparison
    if (formData.title.trim()) {
      const priceResult = await comparePrices(formData.title.trim(), formData.brand || undefined);
      if (priceResult) {
        setPriceComparison(priceResult);
        setAIResult(null);
        setShowAIConfirmDialog(true);
      }
      return;
    }

    // No title — need image
    if (formData.images.length === 0) {
      toast({
        title: 'Sin imagen ni nombre',
        description: 'Agrega una imagen o escribe el nombre del producto para identificarlo',
        variant: 'destructive',
      });
      return;
    }

    const result = await identifyProduct(formData.images[0], products || []);
    if (result && result.identified) {
      setAIResult(result);
      setPriceComparison(null);
      setShowAIConfirmDialog(true);
    } else {
      toast({
        title: 'No identificado',
        description: result?.notes || 'No se pudo identificar el producto en la imagen',
        variant: 'destructive',
      });
    }
  };

  // After AI identifies, user confirms name → run price comparison
  const handleConfirmNameAndCompare = async () => {
    const name = aiResult?.title || formData.title;
    if (!name) return;
    const priceResult = await comparePrices(name, aiResult?.brand || formData.brand || undefined);
    if (priceResult) {
      setPriceComparison(priceResult);
    }
  };

  const applyAIResult = () => {
    if (aiResult) {
      setFormData(prev => ({
        ...prev,
        title: aiResult.title || prev.title,
        sku: aiResult.sku || prev.sku,
        brand: aiResult.brand || prev.brand,
        price: priceComparison?.estimatedPrice?.toString() || aiResult.price?.toString() || prev.price,
        categories: aiResult.categories || prev.categories,
        description: aiResult.description || prev.description,
      }));
    } else if (priceComparison) {
      // Only price comparison (name already existed)
      setFormData(prev => ({
        ...prev,
        price: priceComparison.estimatedPrice?.toString() || prev.price,
      }));
    }
    
    setShowAIConfirmDialog(false);
    setManualProductName('');
    setPriceComparison(null);
    toast({ title: 'Información aplicada' });
  };

  const handleReidentifyWithName = async () => {
    if (!manualProductName.trim() || formData.images.length === 0) return;
    setIsReidentifying(true);
    const result = await identifyProduct(formData.images[0], products || [], manualProductName.trim());
    setIsReidentifying(false);
    if (result && result.identified) {
      setAIResult(result);
      setPriceComparison(null);
      setManualProductName('');
      toast({ title: 'Producto re-identificado' });
    } else {
      toast({
        title: 'No encontrado',
        description: result?.notes || 'No se pudo encontrar información con ese nombre',
        variant: 'destructive',
      });
    }
  };

  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !formData.categories.includes(trimmed)) {
      setFormData(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    }
    setCategoryInput('');
    setShowCategorySuggestions(false);
  };

  const removeCategory = (cat: string) => {
    setFormData(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }));
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
            {totalCount?.toLocaleString('es-MX') || 0} {isVendedor && !isStaff ? 'publicaciones' : 'productos'} 
            {isVendedor && !isStaff ? '' : ' en inventario'}
            {products && products.length < (totalCount || 0) ? ` · Mostrando ${(page * PAGE_SIZE) + 1}-${Math.min((page + 1) * PAGE_SIZE, totalCount || 0)}` : ''}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar por título, SKU o marca..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-10"
            />
          </div>

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
                  {editingProduct ? 'Editar Producto' : (isVendedor && !isStaff ? 'Nueva Publicación' : 'Agregar Producto')}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Modifica los datos del producto' : (isVendedor && !isStaff ? 'Completa los datos. Tu publicación se guardará como borrador.' : 'Completa los datos del nuevo producto')}
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
                      disabled={identifying || comparingPrices}
                      className="gap-2"
                    >
                      {identifying || comparingPrices ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      {identifying ? 'Identificando...' : comparingPrices ? 'Comparando precios...' : (formData.title.trim() ? 'Comparar Precios AI' : 'Identificador AI')}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="auction_min_price">Precio mínimo / "Compra ya" (MXN) *</Label>
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
                          <Input id="auction_start" type="datetime-local" value={formData.auction_start}
                            onChange={(e) => setFormData({ ...formData, auction_start: e.target.value })}
                            required={formData.is_auction} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="auction_end">Fin de subasta *</Label>
                          <Input id="auction_end" type="datetime-local" value={formData.auction_end}
                            onChange={(e) => setFormData({ ...formData, auction_end: e.target.value })}
                            min={formData.auction_start} required={formData.is_auction} />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Precio (MXN)</Label>
                          <Input id="price" type="number" step="0.01" value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="Dejar vacío si requiere cotización"
                            disabled={formData.contact_for_quote} />
                        </div>
                        <div className="flex items-end pb-2">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Switch id="contact_for_quote" checked={formData.contact_for_quote}
                                onCheckedChange={(checked) => setFormData({ ...formData, contact_for_quote: checked, price: checked ? '' : formData.price })} />
                              <Label htmlFor="contact_for_quote" className="text-sm">Contactar para cotización</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch id="allow_offers" checked={formData.allow_offers}
                                onCheckedChange={(checked) => setFormData({ ...formData, allow_offers: checked })} />
                              <Label htmlFor="allow_offers" className="text-sm">Permitir ofertas / negociación</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" type="number" value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Sucursal (público)</Label>
                    <select
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Sin sucursal</option>
                      <option value="Hermosillo">Hermosillo</option>
                      <option value="Mexicali">Mexicali</option>
                      <option value="Santa Catarina">Santa Catarina</option>
                      <option value="Tijuana">Tijuana</option>
                      <option value="Nogales, AZ">Nogales, AZ</option>
                      <option value="Coahuila">Coahuila</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warehouse_code">Código bodega (interno)</Label>
                    <Input
                      id="warehouse_code"
                      value={(formData as any).warehouse_code || ''}
                      onChange={(e) => setFormData({ ...formData, warehouse_code: e.target.value } as any)}
                      placeholder="Ej: B1 RO8"
                    />
                  </div>

                  {/* Category Picker */}
                  <div className="space-y-2 col-span-2">
                    <Label>Categorías</Label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formData.categories.map(cat => (
                        <Badge key={cat} variant="secondary" className="gap-1 pr-1">
                          {cat}
                          <button type="button" onClick={() => removeCategory(cat)} className="ml-1 hover:text-destructive">
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="relative">
                      <Input
                        placeholder="Buscar o agregar categoría..."
                        value={categoryInput}
                        onChange={(e) => { setCategoryInput(e.target.value); setShowCategorySuggestions(true); }}
                        onFocus={() => setShowCategorySuggestions(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (categoryInput.trim()) addCategory(categoryInput);
                          }
                        }}
                      />
                      {showCategorySuggestions && filteredCategories.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md max-h-48 overflow-y-auto">
                          {filteredCategories.slice(0, 15).map(cat => (
                            <button
                              key={cat}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                              onClick={() => addCategory(cat)}
                            >
                              {cat}
                              {formData.categories.includes(cat) && <Check size={14} className="text-primary" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {categoryInput.trim() && !existingCategories?.includes(categoryInput.trim()) && (
                      <button type="button" onClick={() => addCategory(categoryInput)}
                        className="text-xs text-primary hover:underline mt-1">
                        + Crear categoría "{categoryInput.trim()}"
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Descripción</Label>
                      <button type="button"
                        onClick={() => setFormData({ ...formData, _showRawHtml: !((formData as any)._showRawHtml) } as any)}
                        className="text-xs text-muted-foreground hover:text-foreground underline">
                        {(formData as any)._showRawHtml ? 'Ver renderizado' : 'Editar HTML'}
                      </button>
                    </div>
                    {(formData as any)._showRawHtml ? (
                      <Textarea id="description" value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={6} />
                    ) : (
                      <div 
                        className="min-h-[100px] max-h-[200px] overflow-auto rounded-md border border-input bg-background px-3 py-2 text-sm prose prose-sm max-w-none [&_h6]:font-bold [&_h6]:mt-3 [&_h6]:mb-1 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-0.5 [&_p]:mb-1"
                        dangerouslySetInnerHTML={{ __html: (formData.description || '<span class="text-muted-foreground">Sin descripción</span>').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '') }}
                      />
                    )}
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
                        <Input id="peso_aprox_kg" type="number" step="0.1" min="0" value={formData.peso_aprox_kg}
                          onChange={(e) => setFormData({ ...formData, peso_aprox_kg: e.target.value })} placeholder="Ej: 150" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="largo_aprox_cm">Largo (cm) *</Label>
                        <Input id="largo_aprox_cm" type="number" min="0" value={formData.largo_aprox_cm}
                          onChange={(e) => setFormData({ ...formData, largo_aprox_cm: e.target.value })} placeholder="Ej: 120" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ancho_aprox_cm">Ancho (cm) *</Label>
                        <Input id="ancho_aprox_cm" type="number" min="0" value={formData.ancho_aprox_cm}
                          onChange={(e) => setFormData({ ...formData, ancho_aprox_cm: e.target.value })} placeholder="Ej: 100" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alto_aprox_cm">Alto (cm) *</Label>
                        <Input id="alto_aprox_cm" type="number" min="0" value={formData.alto_aprox_cm}
                          onChange={(e) => setFormData({ ...formData, alto_aprox_cm: e.target.value })} placeholder="Ej: 80" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cp_origen">CP origen *</Label>
                        <Input id="cp_origen" type="text" maxLength={5} value={formData.cp_origen}
                          onChange={(e) => setFormData({ ...formData, cp_origen: e.target.value.replace(/\D/g, '') })} placeholder="Ej: 83000" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      * Estos datos son obligatorios para publicar el producto y permitir cotización de envío.
                    </p>
                  </div>

                  {isStaff && (
                    <div className="flex items-center gap-2">
                      <Switch id="is_active" checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                      <Label htmlFor="is_active">Publicar (visible en catálogo)</Label>
                    </div>
                  )}

                  {isStaff && (
                    <div className="flex items-center gap-2">
                      <Switch id="is_featured" checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} />
                      <Label htmlFor="is_featured">Destacado</Label>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Switch id="is_new" checked={formData.is_new}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })} />
                    <Label htmlFor="is_new">Nuevo</Label>
                  </div>
                </div>

                {isVendedor && !isStaff && !editingProduct && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Nota:</strong> Tu publicación se guardará como borrador. Una vez que esté lista, 
                      podrás solicitar su publicación desde la lista de productos.
                    </p>
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
                  <Button type="submit" className="btn-gold" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Guardando...' : (isVendedor && !isStaff && !editingProduct ? 'Guardar Borrador' : 'Guardar')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={16} className="text-muted-foreground" />
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as any); setPage(0); }}
          className="text-sm rounded-md border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">Todos los estados</option>
          <option value="active">Publicados</option>
          <option value="draft">Borradores</option>
        </select>
        <select value={filterPrice} onChange={(e) => { setFilterPrice(e.target.value as any); setPage(0); }}
          className="text-sm rounded-md border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">Todos los precios</option>
          <option value="with_price">Con precio</option>
          <option value="no_price">Sin precio</option>
        </select>
        <select value={filterLocation} onChange={(e) => { setFilterLocation(e.target.value); setPage(0); }}
          className="text-sm rounded-md border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">Todas las sucursales</option>
          <option value="Hermosillo">Hermosillo</option>
          <option value="Mexicali">Mexicali</option>
          <option value="Santa Catarina">Santa Catarina</option>
          <option value="Tijuana">Tijuana</option>
          <option value="Nogales, AZ">Nogales, AZ</option>
          <option value="Coahuila">Coahuila</option>
          <option value="none">Sin sucursal</option>
        </select>
        {(filterStatus !== 'all' || filterPrice !== 'all' || filterLocation !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterStatus('all'); setFilterPrice('all'); setFilterLocation('all'); setPage(0); }} className="text-xs">
            <X size={14} className="mr-1" /> Limpiar filtros
          </Button>
        )}
      </div>

      {/* AI Confirmation Dialog — Enhanced with price comparison */}
      <AlertDialog open={showAIConfirmDialog} onOpenChange={(open) => {
        setShowAIConfirmDialog(open);
        if (!open) { setManualProductName(''); setPriceComparison(null); }
      }}>
        <AlertDialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" size={20} />
              {aiResult ? 'Producto identificado' : 'Comparación de precios'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {aiResult && (
                  <>
                    <p>El AI ha identificado el producto:</p>
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
                    
                    {/* Compare prices button */}
                    {!priceComparison && (
                      <Button type="button" variant="outline" size="sm" className="w-full gap-2"
                        onClick={handleConfirmNameAndCompare} disabled={comparingPrices}>
                        {comparingPrices ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                        {comparingPrices ? 'Comparando precios...' : '¿Es correcto? Comparar precios de mercado'}
                      </Button>
                    )}
                  </>
                )}

                {/* Price comparison results */}
                {priceComparison && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <DollarSign size={16} className="text-green-600" />
                      Precio estimado de mercado
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Mínimo</p>
                        <p className="font-semibold text-sm">${priceComparison.priceRange.min?.toLocaleString('es-MX')}</p>
                      </div>
                      <div className="bg-primary/10 rounded-lg py-1">
                        <p className="text-xs text-muted-foreground">Estimado</p>
                        <p className="font-bold text-primary">${priceComparison.estimatedPrice?.toLocaleString('es-MX')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Máximo</p>
                        <p className="font-semibold text-sm">${priceComparison.priceRange.max?.toLocaleString('es-MX')}</p>
                      </div>
                    </div>
                    
                    {priceComparison.references?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">Referencias encontradas:</p>
                        {priceComparison.references.map((ref, i) => (
                          <div key={i} className="flex items-center justify-between text-xs bg-background rounded px-2 py-1.5">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{ref.name}</p>
                              <p className="text-muted-foreground">{ref.source} · {ref.condition || 'N/A'}</p>
                            </div>
                            <span className="font-semibold ml-2 whitespace-nowrap">${ref.price?.toLocaleString('es-MX')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {priceComparison.notes && (
                      <p className="text-xs text-muted-foreground italic">{priceComparison.notes}</p>
                    )}
                  </div>
                )}
                
                {/* Manual search section */}
                {aiResult && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                      ¿No es correcto? Introduce el nombre del producto:
                    </p>
                    <div className="flex gap-2">
                      <Input placeholder="Ej: Motor Caterpillar C15" value={manualProductName}
                        onChange={(e) => setManualProductName(e.target.value)} className="flex-1"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleReidentifyWithName(); } }} />
                      <Button type="button" variant="outline" size="sm"
                        onClick={handleReidentifyWithName} disabled={isReidentifying || !manualProductName.trim()}>
                        {isReidentifying ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                      </Button>
                    </div>
                  </div>
                )}
                
                <p className="text-sm">¿Deseas aplicar esta información al formulario?</p>
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
            <AlertDialogAction onClick={() => {
              if (productToDelete) {
                deleteMutation.mutate(productToDelete);
                setProductToDelete(null);
                setShowDeleteDialog(false);
              }
            }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reason Dialog for stock/location changes */}
      <AlertDialog open={showReasonDialog} onOpenChange={(open) => {
        if (!open) { setShowReasonDialog(false); setChangeReason(''); setReasonContext(null); setPendingSaveData(null); }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reasonContext?.type === 'stock_decrease' && '¿Por qué bajó el stock?'}
              {reasonContext?.type === 'stock_increase' && '¿De dónde viene el nuevo stock?'}
              {reasonContext?.type === 'location_change' && '¿Por qué se movió de ubicación?'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm">
                  {reasonContext?.prev} → {reasonContext?.next}
                </p>
                <Input
                  placeholder={
                    reasonContext?.type === 'stock_decrease' ? 'Ej: Se vendió 1 pieza al cliente X' :
                    reasonContext?.type === 'stock_increase' ? 'Ej: Compra a proveedor Y' :
                    'Ej: Reubicación por inventario'
                  }
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  autoFocus
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveWithReason} className="btn-gold">
              Guardar con razón
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request Publication Dialog */}
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
            <AlertDialogAction onClick={() => {
              if (productToRequest) {
                requestPublicationMutation.mutate(productToRequest.id);
                setProductToRequest(null);
              }
            }} className="btn-gold">Enviar Solicitud</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product History Dialog */}
      <ProductHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        productId={historyProductId}
        productTitle={historyProductTitle}
      />

      {/* Products Table */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="hidden sm:table-cell">SKU</TableHead>
              <TableHead className="hidden sm:table-cell">Marca</TableHead>
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
                  <TableCell className="hidden sm:table-cell">
                    <span className="font-mono text-sm">{product.sku}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{product.brand}</TableCell>
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
                          <CheckCircle size={12} className="mr-1" /> Publicado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10">
                          <Clock size={12} className="mr-1" /> Borrador
                        </Badge>
                      )}
                      {(['pending', 'pending_approval'].includes((product as any).approval_status)) && (
                        <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-500/10">
                          <Clock size={12} className="mr-1" /> Pendiente
                        </Badge>
                      )}
                      {(product as any).approval_status === 'rejected' && (
                        <Badge variant="outline" className="border-red-500 text-red-600 bg-red-500/10">
                          {(product as any).review_notes ? '⚠️ Necesita Revisión' : 'Rechazado'}
                        </Badge>
                      )}
                      {product.is_featured && (
                        <Badge variant="outline" className="border-primary text-primary bg-primary/10">Destacado</Badge>
                      )}
                    </div>
                    {(product as any).review_notes && (product as any).approval_status === 'rejected' && (
                      <p className="text-xs text-destructive mt-1 max-w-[200px] truncate" title={(product as any).review_notes}>
                        📝 {(product as any).review_notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit size={16} className="mr-1" /> Acciones
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(product)}>
                          <Edit size={16} className="mr-2" /> Editar
                        </DropdownMenuItem>
                        
                        {/* History */}
                        <DropdownMenuItem onClick={() => {
                          setHistoryProductId(product.id);
                          setHistoryProductTitle(product.title);
                          setShowHistoryDialog(true);
                        }}>
                          <History size={16} className="mr-2" /> Historial
                        </DropdownMenuItem>
                        
                        {isStaff && (
                          <>
                            <DropdownMenuSeparator />
                            {product.is_active ? (
                              <DropdownMenuItem onClick={() => togglePublishMutation.mutate({ productId: product.id, isActive: false })}>
                                <EyeOff size={16} className="mr-2" /> Despublicar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => togglePublishMutation.mutate({ productId: product.id, isActive: true })}>
                                <Eye size={16} className="mr-2" /> Publicar
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        
                        {(isVendedor || isStaff) && !product.is_active && (product as any).approval_status !== 'pending_approval' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setProductToRequest(product); setShowPublishRequestDialog(true); }}>
                              <Send size={16} className="mr-2" />
                              {(product as any).approval_status === 'rejected' ? 'Reenviar a Aprobación' : 'Solicitar Publicación'}
                            </DropdownMenuItem>
                          </>
                        )}

                        {isStaff && (product as any).approval_status === 'pending_approval' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              supabase.from('products').update({ approval_status: 'approved', is_active: true }).eq('id', product.id).then(() => {
                                queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                                toast({ title: 'Producto aprobado y publicado' });
                              });
                            }}>
                              <CheckCircle size={16} className="mr-2 text-green-600" /> Aprobar y Publicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              supabase.from('products').update({ approval_status: 'rejected' }).eq('id', product.id).then(() => {
                                queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                                toast({ title: 'Producto rechazado', variant: 'destructive' });
                              });
                            }}>
                              <EyeOff size={16} className="mr-2 text-red-600" /> Rechazar
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => { setProductToDelete(product.id); setShowDeleteDialog(true); }}>
                          <Trash2 size={16} className="mr-2" /> Eliminar
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

      {/* Pagination */}
      {(totalCount || 0) > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page + 1} de {Math.ceil((totalCount || 0) / PAGE_SIZE)}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronLeft size={16} className="mr-1" /> Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * PAGE_SIZE >= (totalCount || 0)}>
              Siguiente <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventario;
