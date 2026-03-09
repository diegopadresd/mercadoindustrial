import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Package,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const PublicarProducto = () => {
  const { user } = useAuth();
  const { isVendedor, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const editProductId = searchParams.get('edit');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    brand: '',
    description: '',
    price: '',
    original_price: '',
    categories: [] as string[],
    location: '',
    stock: '1',
    // Shipping required fields
    peso_aprox_kg: '',
    largo_aprox_cm: '',
    ancho_aprox_cm: '',
    alto_aprox_cm: '',
    cp_origen: '',
    // Product details (required)
    model: '',
    year: '',
    hours_of_use: '',
    is_functional: true,
    has_warranty: false,
    warranty_duration: '',
    warranty_conditions: '',
    // Flags
    is_active: false,
    is_featured: false,
    is_new: true,
    contact_for_quote: false,
  });

  // Load product for editing
  useEffect(() => {
    if (editProductId && user?.id) {
      setIsLoadingProduct(true);
      supabase
        .from('products')
        .select('*')
        .eq('id', editProductId)
        .eq('seller_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            toast({ title: 'Error', description: 'No se pudo cargar el producto', variant: 'destructive' });
            navigate('/mi-cuenta/mis-publicaciones');
            return;
          }
          setFormData({
            title: data.title || '',
            sku: data.sku || '',
            brand: data.brand || '',
            description: data.description || '',
            price: data.price?.toString() || '',
            original_price: data.original_price?.toString() || '',
            categories: data.categories || [],
            location: data.location || '',
            stock: data.stock?.toString() || '1',
            peso_aprox_kg: data.peso_aprox_kg?.toString() || '',
            largo_aprox_cm: data.largo_aprox_cm?.toString() || '',
            ancho_aprox_cm: data.ancho_aprox_cm?.toString() || '',
            alto_aprox_cm: data.alto_aprox_cm?.toString() || '',
            cp_origen: data.cp_origen || '',
            model: (data as any).model || '',
            year: (data as any).year?.toString() || '',
            hours_of_use: (data as any).hours_of_use?.toString() || '',
            is_functional: (data as any).is_functional ?? true,
            has_warranty: (data as any).has_warranty || false,
            warranty_duration: (data as any).warranty_duration || '',
            warranty_conditions: (data as any).warranty_conditions || '',
            is_active: data.is_active || false,
            is_featured: data.is_featured || false,
            is_new: data.is_new || false,
            contact_for_quote: data.contact_for_quote || false,
          });
          setImages(data.images || []);
          setIsLoadingProduct(false);
        });
    }
  }, [editProductId, user?.id, navigate, toast]);

  const canPublish = () => {
    const hasShippingData = formData.peso_aprox_kg && formData.largo_aprox_cm && formData.ancho_aprox_cm && 
           formData.alto_aprox_cm && formData.cp_origen;
    const hasProductDetails = formData.model && formData.year && formData.hours_of_use;
    return hasShippingData && hasProductDetails;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user?.id) return;

    if (images.length >= 10) {
      toast({ title: 'Límite de imágenes', description: 'Solo puedes subir hasta 10 imágenes por producto', variant: 'destructive' });
      return;
    }

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) {
        toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'destructive' });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setImages(prev => [...prev, publicUrl]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    
    if (!user?.id) return;

    if (!formData.title || !formData.sku || !formData.brand) {
      toast({ title: 'Campos requeridos', description: 'Completa título, SKU y marca', variant: 'destructive' });
      return;
    }

    if (publish && !canPublish()) {
      toast({ 
        title: 'Datos incompletos', 
        description: 'Para publicar necesitas: peso, dimensiones, CP origen, modelo, año y horas de uso',
        variant: 'destructive'
      });
      return;
    }

    if (publish && formData.has_warranty && (!formData.warranty_duration || !formData.warranty_conditions)) {
      toast({ 
        title: 'Garantía incompleta', 
        description: 'Si ofreces garantía, debes especificar la duración y condiciones',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const productData = {
        title: formData.title,
        sku: formData.sku,
        brand: formData.brand,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        categories: formData.categories,
        location: formData.location,
        stock: parseInt(formData.stock) || 1,
        peso_aprox_kg: formData.peso_aprox_kg ? parseFloat(formData.peso_aprox_kg) : null,
        largo_aprox_cm: formData.largo_aprox_cm ? parseFloat(formData.largo_aprox_cm) : null,
        ancho_aprox_cm: formData.ancho_aprox_cm ? parseFloat(formData.ancho_aprox_cm) : null,
        alto_aprox_cm: formData.alto_aprox_cm ? parseFloat(formData.alto_aprox_cm) : null,
        cp_origen: formData.cp_origen,
        model: formData.model || null,
        year: formData.year ? parseInt(formData.year) : null,
        hours_of_use: formData.hours_of_use ? parseInt(formData.hours_of_use) : null,
        is_functional: formData.is_functional,
        has_warranty: formData.has_warranty,
        warranty_duration: formData.has_warranty ? formData.warranty_duration : null,
        warranty_conditions: formData.has_warranty ? formData.warranty_conditions : null,
        is_active: publish ? true : formData.is_active,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        contact_for_quote: formData.contact_for_quote,
        images,
        seller_id: user.id,
      };

      if (editProductId) {
        const updateData = publish
          ? { ...productData, approval_status: 'pending' }
          : productData;

        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', editProductId)
          .eq('seller_id', user.id);

        if (error) throw error;
        toast({ title: 'Producto actualizado' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...productData,
            id: uuidv4(),
            approval_status: 'pending',
          });

        if (error) throw error;
        toast({ title: publish ? 'Producto publicado' : 'Producto guardado como borrador' });
      }

      navigate('/mi-cuenta/mis-publicaciones');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ title: 'Error', description: 'No se pudo guardar el producto', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (roleLoading || isLoadingProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/mi-cuenta/mis-publicaciones">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold">
                {editProductId ? 'Editar Producto' : 'Publicar Producto'}
              </h1>
              <p className="text-muted-foreground">
                {editProductId ? 'Modifica la información de tu producto' : 'Agrega un nuevo producto a tu catálogo'}
              </p>
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)}>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <h2 className="font-semibold mb-4">Información básica</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título del producto *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Motor eléctrico trifásico 5HP"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sku">SKU *</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="Ej: MOT-5HP-001"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="brand">Marca *</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          placeholder="Ej: Siemens"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe tu producto..."
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Precio (MXN)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          placeholder="1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="contact_for_quote"
                          checked={formData.contact_for_quote}
                          onCheckedChange={(checked) => setFormData({ ...formData, contact_for_quote: checked })}
                        />
                        <Label htmlFor="contact_for_quote">Precio por cotizar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_new"
                          checked={formData.is_new}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                        />
                        <Label htmlFor="is_new">Producto nuevo</Label>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Equipment Details - Required */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Detalles del equipo</h2>
                    {(!formData.model || !formData.year || !formData.hours_of_use) && (
                      <span className="text-sm text-amber-600 dark:text-amber-500 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        Requeridos para publicar
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="model">Modelo *</Label>
                        <Input
                          id="model"
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          placeholder="Ej: XJ-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="year">Año *</Label>
                        <Input
                          id="year"
                          type="number"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          placeholder="Ej: 2020"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hours_of_use">Horas de uso *</Label>
                        <Input
                          id="hours_of_use"
                          type="number"
                          min="0"
                          value={formData.hours_of_use}
                          onChange={(e) => setFormData({ ...formData, hours_of_use: e.target.value })}
                          placeholder="Ej: 1500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <Label htmlFor="is_functional" className="text-base font-medium">¿El equipo funciona?</Label>
                          <p className="text-sm text-muted-foreground">Indica si el equipo está en funcionamiento</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${!formData.is_functional ? 'font-semibold text-destructive' : 'text-muted-foreground'}`}>No</span>
                          <Switch
                            id="is_functional"
                            checked={formData.is_functional}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_functional: checked })}
                          />
                          <span className={`text-sm ${formData.is_functional ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>Sí</span>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="has_warranty" className="text-base font-medium">¿Ofrece garantía?</Label>
                            <p className="text-sm text-muted-foreground">Garantía proporcionada por el vendedor</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${!formData.has_warranty ? 'font-semibold' : 'text-muted-foreground'}`}>No</span>
                            <Switch
                              id="has_warranty"
                              checked={formData.has_warranty}
                              onCheckedChange={(checked) => setFormData({ ...formData, has_warranty: checked, warranty_duration: '', warranty_conditions: '' })}
                            />
                            <span className={`text-sm ${formData.has_warranty ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>Sí</span>
                          </div>
                        </div>

                        {formData.has_warranty && (
                          <div className="space-y-3 pt-2 border-t border-border">
                            <div>
                              <Label htmlFor="warranty_duration">Duración de la garantía *</Label>
                              <Input
                                id="warranty_duration"
                                value={formData.warranty_duration}
                                onChange={(e) => setFormData({ ...formData, warranty_duration: e.target.value })}
                                placeholder="Ej: 6 meses, 1 año"
                              />
                            </div>
                            <div>
                              <Label htmlFor="warranty_conditions">Condiciones de la garantía *</Label>
                              <Textarea
                                id="warranty_conditions"
                                value={formData.warranty_conditions}
                                onChange={(e) => setFormData({ ...formData, warranty_conditions: e.target.value })}
                                placeholder="Especifique las condiciones de la garantía..."
                                rows={3}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Shipping Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Datos de envío</h2>
                    {!canPublish() && (
                      <span className="text-sm text-amber-600 dark:text-amber-500 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        Requeridos para publicar
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="peso">Peso (kg) *</Label>
                      <Input
                        id="peso"
                        type="number"
                        step="0.01"
                        value={formData.peso_aprox_kg}
                        onChange={(e) => setFormData({ ...formData, peso_aprox_kg: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="largo">Largo (cm) *</Label>
                      <Input
                        id="largo"
                        type="number"
                        value={formData.largo_aprox_cm}
                        onChange={(e) => setFormData({ ...formData, largo_aprox_cm: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ancho">Ancho (cm) *</Label>
                      <Input
                        id="ancho"
                        type="number"
                        value={formData.ancho_aprox_cm}
                        onChange={(e) => setFormData({ ...formData, ancho_aprox_cm: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="alto">Alto (cm) *</Label>
                      <Input
                        id="alto"
                        type="number"
                        value={formData.alto_aprox_cm}
                        onChange={(e) => setFormData({ ...formData, alto_aprox_cm: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cp_origen">CP Origen *</Label>
                      <Input
                        id="cp_origen"
                        value={formData.cp_origen}
                        onChange={(e) => setFormData({ ...formData, cp_origen: e.target.value })}
                        placeholder="83000"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Ubicación</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ej: Hermosillo, Son."
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Images */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <h2 className="font-semibold mb-4">Imágenes</h2>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={img}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload size={24} className="text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Subir imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-xl border border-border p-6 space-y-3"
                >
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={isSaving || !canPublish()}
                    className="w-full btn-gold"
                  >
                    {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                    Publicar
                  </Button>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isSaving}
                    className="w-full"
                  >
                    <Save size={18} className="mr-2" />
                    Guardar borrador
                  </Button>
                  {!canPublish() && (
                    <p className="text-xs text-muted-foreground text-center">
                      Completa los datos de envío y detalles del equipo para poder publicar
                    </p>
                  )}
                  {formData.has_warranty && (!formData.warranty_duration || !formData.warranty_conditions) && (
                    <p className="text-xs text-amber-600 dark:text-amber-500 text-center">
                      Si ofreces garantía, especifica duración y condiciones
                    </p>
                  )}
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicarProducto;
