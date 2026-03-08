import { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  ArrowLeft, 
  ShoppingCart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Tag, 
  Package,
  ChevronLeft,
  ChevronRight,
  Send,
  DollarSign,
  User,
  Clock,
  ThumbsUp,
  Play,
  Loader2,
  Truck,
  BadgeCheck,
  ShieldCheck,
  PhoneCall,
  Award,
  HelpCircle,
  ZoomIn,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductById } from '@/data/products';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useCreateOffer } from '@/hooks/useOffers';
import { useProduct } from '@/hooks/useProducts';
import { SellerProfileCard } from '@/components/product/SellerProfileCard';
import { SellerReviews } from '@/components/product/SellerReviews';
import { AuctionSection } from '@/components/product/AuctionSection';
import { MakeOfferModal } from '@/components/product/MakeOfferModal';

// Expandable description component
const ExpandableDescription = ({ description }: { description: string }) => {
  const [expanded, setExpanded] = useState(false);
  const MAX_HEIGHT = 300; // px

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
        <Package size={20} className="text-primary" />
        Especificaciones
      </h2>
      <div className="relative">
        <div
          className={`overflow-hidden transition-all duration-300 ${!expanded ? '' : ''}`}
          style={!expanded ? { maxHeight: `${MAX_HEIGHT}px` } : undefined}
        >
          {description.includes('<') ? (
            <div
              className="prose prose-sm max-w-none text-muted-foreground [&_h6]:text-foreground [&_h6]:font-bold [&_h6]:mt-4 [&_h6]:mb-2 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-muted-foreground [&_p]:mb-2"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
              {description}
            </div>
          )}
        </div>
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent pointer-events-none" />
        )}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {expanded ? '▲ Ver menos' : '▼ Ver más especificaciones'}
      </button>
    </div>
  );
};

// Mock Seller Data
const mockSeller = {
  id: 'mercado-industrial',
  name: 'Mercado Industrial',
  avatar: '/logo-mercado-industrial.webp',
  positivePercentage: 99.5,
  totalSales: 15420,
  joinedDate: 'junio 2018',
  description: 'Mercado Industrial es el marketplace líder en México para maquinaria y equipo industrial. Ofrecemos equipos de alta calidad, con garantía y envío a todo el país. Nuestro equipo de expertos está disponible para asesorarte en la selección del equipo ideal para tu negocio.',
  ratings: [
    { label: '¿Fue precisa la descripción?', score: 4.9 },
    { label: '¿Fue razonable el costo del envío?', score: 4.8 },
    { label: '¿Fue rápido el envío?', score: 4.7 },
    { label: '¿Comunicación del vendedor?', score: 5.0 },
  ],
};

// Mock Reviews Data
const mockReviews = [
  {
    id: '1',
    username: 'eduardo_mx',
    reviewCount: 831,
    timeAgo: 'Últimos 6 meses',
    comment: 'Excelente equipo, llegó en perfectas condiciones y muy bien embalado. La calidad es exactamente como se describe.',
    isVerified: true,
    category: 'calidad',
    rating: 'positive' as const,
  },
  {
    id: '2',
    username: 'carlos_industrial',
    reviewCount: 1603,
    timeAgo: 'Mes pasado',
    comment: 'Transacción fluida, entrega rápida, artículo como se describe, buena relación calidad-precio y bien empaquetado. Vendedor de primera clase. Muchas gracias.',
    isVerified: true,
    category: 'valor',
    rating: 'positive' as const,
  },
  {
    id: '3',
    username: 'fabricio_t',
    reviewCount: 173,
    timeAgo: 'Mes pasado',
    comment: 'Impresionante producto y muy bien embalado. Totalmente recomendado.',
    isVerified: true,
    category: 'satisfaccion',
    rating: 'positive' as const,
  },
  {
    id: '4',
    username: 'beatriz_norte',
    reviewCount: 807,
    timeAgo: 'Últimos 6 meses',
    comment: 'Impresionante vendedor y artículo. Todo perfecto.',
    isVerified: true,
    category: 'aspecto',
    rating: 'positive' as const,
  },
  {
    id: '5',
    username: 'william_n',
    reviewCount: 1594,
    timeAgo: 'El año pasado',
    comment: 'Excelente por el precio, fácilmente uno de los artículos de mejor valor que he encontrado aquí. Resiste muy bien, lo uso a diario y funciona perfecto.',
    isVerified: true,
    category: 'uso',
    rating: 'positive' as const,
  },
];

import { extractProductId, generateProductUrl } from '@/lib/slugify';
import { PageMeta } from '@/components/seo/PageMeta';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import { getSocialShareUrl } from '@/lib/sharing';

const SITE_URL = 'https://mercadoindustrial.lovable.app';

const ProductoDetalle = () => {
  const { id: slugParam } = useParams();
  const id = extractProductId(slugParam || '');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addToCart } = useCart();
  const { formatPrice } = useLocale();
  const createOffer = useCreateOffer();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch product from database (primary source)
  const { data: dbProduct, isLoading: dbLoading } = useProduct(id || '');
  
  // Get product from static data as fallback
  const staticProduct = getProductById(id || '');

  // Fire-and-forget view increment (works for all visitors, no auth required)
  useEffect(() => {
    if (!id) return;
    supabase.rpc('increment_product_view', { _product_id: id });
  }, [id]);

  // Fetch product-specific questions from Supabase
  const { data: productQuestions = [] } = useQuery({
    queryKey: ['product-questions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_questions')
        .select('*')
        .eq('product_id', id!)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Combine product data: prefer database, fallback to static
  const productData = dbProduct ? {
    id: dbProduct.id,
    title: dbProduct.title,
    sku: dbProduct.sku,
    brand: dbProduct.brand,
    price: dbProduct.price ?? undefined,
    stock: dbProduct.stock ?? 1,
    location: dbProduct.location || 'Virtual',
    branch: dbProduct.location || 'Virtual',
    image: dbProduct.images?.[0] || '/placeholder.svg',
    images: dbProduct.images?.length ? dbProduct.images : ['/placeholder.svg'],
    categories: dbProduct.categories || [],
    tags: dbProduct.categories || [],
    allow_offers: (dbProduct as any).allow_offers ?? false,
    description: dbProduct.description || `${dbProduct.title}\n\nDescripción general:\n• Marca: ${dbProduct.brand}\n• SKU: ${dbProduct.sku}\n• Categorías: ${(dbProduct.categories || []).join(', ')}`,
    specs: dbProduct.specifications as Record<string, string> | undefined,
    youtubeUrl: undefined,
    isNew: dbProduct.is_new ?? false,
    isFeatured: dbProduct.is_featured ?? false,
    seller_id: (dbProduct as any).seller_id ?? null,
    is_auction: (dbProduct as any).is_auction ?? false,
    auction_min_price: (dbProduct as any).auction_min_price ?? null,
    auction_start: (dbProduct as any).auction_start ?? null,
    auction_end: (dbProduct as any).auction_end ?? null,
    auction_status: (dbProduct as any).auction_status ?? 'inactive',
    contact_for_quote: (dbProduct as any).contact_for_quote ?? false,
  } : staticProduct;

  // Show loading while fetching from database
  if (dbLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando producto...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!productData) {
    return <Navigate to="/catalogo-mi" replace />;
  }

  const handleQuoteShipping = () => {
    navigate(`/cotizador?productoId=${id}`);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === productData.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productData.images.length - 1 : prev - 1
    );
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    
    if (!user || !profile) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para hacer una pregunta.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('product_questions').insert({
      product_id: id!,
      question: newQuestion,
      customer_name: profile.full_name || 'Cliente',
      customer_email: profile.email,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar tu pregunta. Intenta de nuevo.',
        variant: 'destructive',
      });
      return;
    }

    setNewQuestion('');
    setQuestionDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['product-questions', id] });
    toast({
      title: '¡Pregunta enviada!',
      description: 'Tu pregunta ha sido enviada. Recibirás una respuesta pronto.',
    });
  };

  const handleSubmitOffer = async () => {
    if (!offerAmount) return;
    
    if (!user || !profile) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para hacer una oferta.',
        variant: 'destructive',
      });
      return;
    }
    
    await createOffer.mutateAsync({
      product_id: id!,
      offer_price: Number(offerAmount),
      original_price: productData?.price || null,
      user_id: user.id,
      customer_name: profile.full_name || 'Cliente',
      customer_email: profile.email,
      customer_phone: profile.phone || undefined,
    });
    
    setOfferAmount('');
    setOfferDialogOpen(false);
  };

  const shareProduct = async () => {
    const dbSlug = (dbProduct as any)?.slug;
    const productPath = dbSlug
      ? generateProductUrl(dbSlug, productData.id, true)
      : generateProductUrl(productData.title, productData.id);
    const shareUrl = getSocialShareUrl(productPath);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: productData.title,
          text: `Mira este producto en Mercado Industrial: ${productData.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`${productData.title}\n${shareUrl}`)}`,
        '_blank'
      );
    }
  };

  const handleAddToCart = async () => {
    if (!productData) return;
    await addToCart({
      productId: productData.id,
      title: productData.title,
      sku: productData.sku,
      brand: productData.brand,
      price: productData.price ?? null,
      image: productData.images?.[0] || '/placeholder.svg',
      slug: productData.slug || null,
    });
  };

  const handleBuyNow = async () => {
    if (!productData) return;
    await addToCart({
      productId: productData.id,
      title: productData.title,
      sku: productData.sku,
      brand: productData.brand,
      price: productData.price ?? null,
      image: productData.images?.[0] || '/placeholder.svg',
      slug: productData.slug || null,
    });
    navigate('/carrito');
  };

  const handleQuoteRequest = () => {
    if (!productData) return;
    navigate(`/cotizador?productoId=${productData.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title={`${productData.title} - ${productData.brand}`}
        description={`${productData.title} marca ${productData.brand}. SKU: ${productData.sku}. ${'contact_for_quote' in productData && productData.contact_for_quote || !productData.price ? 'Solicita cotización.' : `Precio: $${productData.price?.toLocaleString('es-MX')} MXN.`} Compra en Mercado Industrial.`}
        image={productData.images?.[0] || undefined}
        url={`${SITE_URL}${(dbProduct as any)?.slug ? generateProductUrl((dbProduct as any).slug, productData.id, true) : generateProductUrl(productData.title, productData.id)}`}
        type="product"
      />
      <ProductJsonLd
        name={productData.title}
        description={productData.description || productData.title}
        sku={productData.sku}
        brand={productData.brand}
        image={productData.images?.[0] || '/placeholder.svg'}
        price={productData.price}
        url={`${SITE_URL}${(dbProduct as any)?.slug ? generateProductUrl((dbProduct as any).slug, productData.id, true) : generateProductUrl(productData.title, productData.id)}`}
        condition={productData.isNew ? 'NewCondition' : 'UsedCondition'}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link 
          to="/catalogo-mi" 
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft size={18} />
          Regresar al catálogo
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted mb-4 cursor-zoom-in" onClick={() => setZoomOpen(true)}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={productData.images[currentImageIndex]}
                  alt={productData.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-background rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-background rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <ChevronRight size={24} />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {productData.images.length}
              </div>

              {/* Zoom hint */}
              <div className="absolute top-4 left-4 bg-background/80 rounded-full p-1.5 opacity-70">
                <ZoomIn size={16} />
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); shareProduct(); }}
                className="absolute top-4 right-4 w-10 h-10 bg-background/80 hover:bg-background rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Image Zoom Lightbox */}
            <AnimatePresence>
              {zoomOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-foreground/90 flex items-center justify-center p-4"
                  onClick={() => setZoomOpen(false)}
                >
                  <button
                    onClick={() => setZoomOpen(false)}
                    className="absolute top-4 right-4 w-10 h-10 bg-background/20 hover:bg-background/40 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/20 hover:bg-background/40 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <motion.img
                    key={currentImageIndex}
                    src={productData.images[currentImageIndex]}
                    alt={productData.title}
                    className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/20 hover:bg-background/40 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight size={28} />
                  </button>
                  <div className="absolute bottom-4 text-white/70 text-sm">
                    {currentImageIndex + 1} / {productData.images.length}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {productData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* YouTube Video */}
            {productData.youtubeUrl && (
              <div className="mt-6">
                <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <Play size={20} className="text-primary" />
                  Video del producto
                </h3>
                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                  <iframe
                    src={`https://www.youtube.com/embed/${
                      productData.youtubeUrl.match(/(?:youtu\.be\/|[?&]v=)([^&\s]+)/)?.[1] ?? ''
                    }`}
                    title="Video del producto"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            {productData.tags && productData.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <Tag size={18} className="text-primary" />
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {productData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Q&A Section - In Left Column */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl mb-1">
                    Preguntas y Respuestas
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {productQuestions.length > 0 
                      ? `${productQuestions.length} pregunta${productQuestions.length !== 1 ? 's' : ''} sobre este producto`
                      : 'Preguntas sobre este producto'}
                  </p>
                </div>
                <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="btn-gold">
                      <MessageCircle className="mr-2" size={16} />
                      Hacer una pregunta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hacer una pregunta</DialogTitle>
                      <DialogDescription>
                        Tu pregunta será respondida por el vendedor y quedará visible para otros compradores.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="question">Tu pregunta</Label>
                        <Textarea
                          id="question"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Escribe tu pregunta sobre este producto..."
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleSubmitQuestion} className="w-full btn-gold">
                        <Send size={18} className="mr-2" />
                        Enviar pregunta
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {productQuestions.length === 0 ? (
                <div className="bg-card rounded-2xl p-8 shadow-card text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <HelpCircle size={28} className="text-primary" />
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    ¡Aún no se han hecho preguntas!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    ¿Tienes alguna duda? Pregunta ahora y te responderemos lo antes posible.
                  </p>
                  <Button size="sm" className="btn-gold" onClick={() => setQuestionDialogOpen(true)}>
                    <MessageCircle className="mr-2" size={16} />
                    Pregunta ahora
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {productQuestions.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-card rounded-xl p-5 shadow-card"
                    >
                      <div className="flex gap-3 mb-3">
                        <div className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-foreground">{faq.customer_name}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(faq.created_at).toLocaleDateString('es-MX')}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{faq.question}</p>
                        </div>
                      </div>
                      {faq.answer ? (
                        <div className="ml-11 pl-3 border-l-2 border-primary/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-primary">Mercado Industrial</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock size={10} />
                              {faq.answered_at ? new Date(faq.answered_at).toLocaleDateString('es-MX') : ''}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-1 transition-colors">
                            <ThumbsUp size={12} />
                            Útil
                          </button>
                        </div>
                      ) : (
                        <div className="ml-11 pl-3 border-l-2 border-muted">
                          <p className="text-sm text-muted-foreground italic">
                            Esperando respuesta del vendedor...
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Title */}
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground leading-tight mb-4">
                {productData.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {productData.categories.map((cat) => (
                  <Badge key={cat} className="bg-primary/10 text-primary hover:bg-primary/20">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {/* General Info Card */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h2 className="font-display font-bold text-xl mb-4">
                Descripción general
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">SKU</span>
                  <span className="font-semibold">{productData.sku}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Marca</span>
                  <Link to={`/catalogo-mi?marca=${encodeURIComponent(productData.brand)}`} className="font-semibold text-primary hover:underline">
                    {productData.brand}
                  </Link>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-semibold">{productData.stock ?? 1} Disponible</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Ubicación</span>
                  <span className="font-semibold">{productData.branch ?? productData.location}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Sucursal</span>
                  <span className="font-semibold flex items-center gap-1">
                    <MapPin size={14} />
                    {productData.location}
                  </span>
                </div>
              </div>

              {/* Price if available */}
              {productData.price && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">Precio</span>
                    <span className="text-3xl font-display font-bold text-primary">
                      {formatPrice(productData.price)}
                    </span>
                  </div>
                </div>
              )}

              {/* Shipping Quote Button */}
              <Button 
                onClick={handleQuoteShipping}
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary/10 mt-4"
              >
                <Truck className="mr-2" size={18} />
                Cotizar envío
              </Button>

              {/* Auction Section */}
              {(productData as any).is_auction && (
                <AuctionSection 
                  product={{
                    id: productData.id,
                    seller_id: (productData as any).seller_id,
                    is_auction: (productData as any).is_auction,
                    auction_min_price: (productData as any).auction_min_price,
                    auction_start: (productData as any).auction_start,
                    auction_end: (productData as any).auction_end,
                    auction_status: (productData as any).auction_status,
                  }}
                />
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {!(productData as any).is_auction && productData.price && !(productData as any).contact_for_quote ? (
                  <>
                  <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1 btn-gold" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2" size={18} />
                        Agregar al carrito
                      </Button>
                      <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={handleBuyNow}>
                        Comprar ahora
                      </Button>
                    </div>
                    {(productData as any).allow_offers && (
                    <Button 
                      className="w-full btn-offer"
                      onClick={() => setOfferDialogOpen(true)}
                    >
                      <DollarSign size={18} className="mr-2" />
                      Hacer una oferta
                    </Button>
                    )}
                    <MakeOfferModal
                      open={offerDialogOpen}
                      onOpenChange={setOfferDialogOpen}
                      product={{
                        id: productData.id,
                        title: productData.title,
                        price: productData.price,
                        seller_id: (productData as any).seller_id,
                      }}
                    />
                  </>
                ) : !(productData as any).is_auction && ((productData as any).contact_for_quote || !productData.price) ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1" variant="outline" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2" size={18} />
                        Agregar al carrito
                      </Button>
                      <Button className="flex-1 btn-gold" onClick={handleQuoteRequest}>
                        Solicitar cotización
                      </Button>
                    </div>
                    {(productData as any).allow_offers && (
                    <Button 
                      className="w-full btn-offer"
                      onClick={() => setOfferDialogOpen(true)}
                    >
                      <DollarSign size={18} className="mr-2" />
                      Hacer una oferta
                    </Button>
                    )}
                    <MakeOfferModal
                      open={offerDialogOpen}
                      onOpenChange={setOfferDialogOpen}
                      product={{
                        id: productData.id,
                        title: productData.title,
                        price: productData.price,
                        seller_id: (productData as any).seller_id,
                      }}
                    />
                  </div>
                ) : !(productData as any).is_auction ? (
                  <div className="flex gap-3">
                    <Button className="flex-1" onClick={handleAddToCart}>
                      <ShoppingCart className="mr-2" size={18} />
                      Agregar al carrito
                    </Button>
                    <Button className="flex-1 btn-gold" onClick={handleQuoteRequest}>
                      <MessageCircle className="mr-2" size={18} />
                      Solicitar cotización
                    </Button>
                  </div>
                ) : null}

                {(productData as any).is_auction && (
                  <>
                    <Button 
                      className="w-full btn-offer"
                      onClick={() => setOfferDialogOpen(true)}
                    >
                      <DollarSign size={18} className="mr-2" />
                      Hacer una oferta directa
                    </Button>
                    <MakeOfferModal
                      open={offerDialogOpen}
                      onOpenChange={setOfferDialogOpen}
                      product={{
                        id: productData.id,
                        title: productData.title,
                        price: (productData as any).auction_min_price,
                        seller_id: (productData as any).seller_id,
                      }}
                    />
                  </>
                )}
              </div>

              {/* Compra con Confianza Section */}
              <div className="border-t border-border pt-6">
                <h3 className="font-display font-bold text-lg mb-4">
                  Compra con confianza
                </h3>
                <div className="space-y-4">
                  {!(productData as any).seller_id && (
                    <div className="flex gap-3 bg-primary/5 rounded-xl p-3 border border-primary/20">
                      <div className="shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Award size={20} className="text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-2">
                          Publicación Oficial de Mercado Industrial
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            Certificada
                          </Badge>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Este producto es publicado directamente por Mercado Industrial, garantizando autenticidad, calidad y soporte directo.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <BadgeCheck size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Programa de vendedor Sobresaliente
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vendedor confiable, envío rápido y devoluciones fáciles.{' '}
                        <Link to="/como-comprar" className="text-foreground underline hover:text-primary">
                          Más información
                        </Link>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <ShieldCheck size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Devolución de tu dinero de Mercado Industrial
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Recibe el artículo que pediste o te devolvemos tu dinero.{' '}
                        <Link to="/politicas-de-pago" className="text-foreground underline hover:text-primary">
                          Más información
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {productData.description && (
              <ExpandableDescription description={productData.description} />
            )}
          </motion.div>
        </div>




        {/* Seller Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="section-title mb-8">
            Información del Vendedor
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <SellerProfileCard 
              seller={mockSeller} 
              productId={productData.id}
              sellerId={(productData as any).seller_id}
            />
            <SellerReviews 
              productReviewCount={12}
              totalReviewCount={13392}
              reviews={mockReviews}
            />
          </div>
        </motion.section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductoDetalle;
