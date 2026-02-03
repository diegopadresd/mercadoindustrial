import { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductById } from '@/data/products';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useCreateOffer } from '@/hooks/useOffers';
import { useProduct } from '@/hooks/useProducts';
import { SellerProfileCard } from '@/components/product/SellerProfileCard';
import { SellerReviews } from '@/components/product/SellerReviews';
import { AuctionSection } from '@/components/product/AuctionSection';
import { MakeOfferModal } from '@/components/product/MakeOfferModal';

// Mock FAQ data
const initialFaqs = [
  {
    id: '1',
    question: '¿Cuál es el tamaño máximo de material que puede procesar este equipo?',
    author: 'Carlos M.',
    date: '2024-01-15',
    answer: 'Por favor contáctanos directamente para obtener especificaciones detalladas sobre este producto.',
    answeredBy: 'Mercado Industrial',
    answeredDate: '2024-01-16',
  },
  {
    id: '2',
    question: '¿Incluye garantía el equipo?',
    author: 'Roberto L.',
    date: '2024-01-18',
    answer: 'Sí, todos nuestros equipos incluyen garantía. Contáctanos para más detalles sobre las condiciones de garantía específicas.',
    answeredBy: 'Mercado Industrial',
    answeredDate: '2024-01-18',
  },
  {
    id: '3',
    question: '¿Pueden enviar a mi ciudad?',
    author: 'Ana G.',
    date: '2024-01-20',
    answer: 'Realizamos envíos a toda la República Mexicana y también a Estados Unidos. El costo de envío se cotiza por separado según el destino.',
    answeredBy: 'Mercado Industrial',
    answeredDate: '2024-01-20',
  },
];

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
  },
  {
    id: '2',
    username: 'carlos_industrial',
    reviewCount: 1603,
    timeAgo: 'Mes pasado',
    comment: 'Transacción fluida, entrega rápida, artículo como se describe, buena relación calidad-precio y bien empaquetado. Vendedor de primera clase. Muchas gracias.',
    isVerified: true,
  },
  {
    id: '3',
    username: 'fabricio_t',
    reviewCount: 173,
    timeAgo: 'Mes pasado',
    comment: 'Impresionante producto y muy bien embalado. Totalmente recomendado.',
    isVerified: true,
  },
  {
    id: '4',
    username: 'beatriz_norte',
    reviewCount: 807,
    timeAgo: 'Últimos 6 meses',
    comment: 'Impresionante vendedor y artículo. Todo perfecto.',
    isVerified: true,
  },
  {
    id: '5',
    username: 'william_n',
    reviewCount: 1594,
    timeAgo: 'El año pasado',
    comment: 'Excelente por el precio, fácilmente uno de los artículos de mejor valor que he encontrado aquí. Resiste muy bien, lo uso a diario y funciona perfecto.',
    isVerified: true,
  },
];

const ProductoDetalle = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addToCart } = useCart();
  const { language, formatPrice, t } = useLocale();
  const createOffer = useCreateOffer();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [faqs, setFaqs] = useState(initialFaqs);
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
    tags: [],
    description: dbProduct.description || `${dbProduct.title}\n\nDescripción general:\n• Marca: ${dbProduct.brand}\n• SKU: ${dbProduct.sku}\n• Categorías: ${(dbProduct.categories || []).join(', ')}`,
    specs: dbProduct.specifications as Record<string, string> | undefined,
    youtubeUrl: undefined,
    isNew: dbProduct.is_new ?? false,
    isFeatured: dbProduct.is_featured ?? false,
    // Auction fields
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

  // If product not found in both sources, redirect to catalog
  if (!productData) {
    return <Navigate to="/catalogo" replace />;
  }

  // Handler to navigate to quoter with product data
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

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) return;
    
    const newFaq = {
      id: Date.now().toString(),
      question: newQuestion,
      author: 'Tú',
      date: new Date().toISOString().split('T')[0],
      answer: null,
      answeredBy: null,
      answeredDate: null,
    };
    
    setFaqs([newFaq, ...faqs]);
    setNewQuestion('');
    setQuestionDialogOpen(false);
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: productData.title,
          text: `Mira este producto en Mercado Industrial: ${productData.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to WhatsApp
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`${productData.title}\n${window.location.href}`)}`,
        '_blank'
      );
    }
  };

  // Handler for adding product to cart
  const handleAddToCart = async () => {
    if (!productData) return;
    
    await addToCart({
      productId: productData.id,
      title: productData.title,
      sku: productData.sku,
      brand: productData.brand,
      price: productData.price ?? null,
      image: productData.images?.[0] || '/placeholder.svg',
    });
  };

  // Handler for buy now - adds to cart and navigates to cart
  const handleBuyNow = async () => {
    if (!productData) return;
    
    await addToCart({
      productId: productData.id,
      title: productData.title,
      sku: productData.sku,
      brand: productData.brand,
      price: productData.price ?? null,
      image: productData.images?.[0] || '/placeholder.svg',
    });
    
    navigate('/carrito');
  };

  // Handler for quote request - adds to cart without price
  const handleQuoteRequest = async () => {
    if (!productData) return;
    
    await addToCart({
      productId: productData.id,
      title: productData.title,
      sku: productData.sku,
      brand: productData.brand,
      price: null,
      image: productData.images?.[0] || '/placeholder.svg',
    });
    
    navigate('/carrito');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link 
          to="/catalogo" 
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft size={18} />
          {language === 'es' ? 'Regresar al catálogo' : 'Back to catalog'}
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted mb-4">
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
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-background rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-background rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <ChevronRight size={24} />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {productData.images.length}
              </div>

              {/* Share Button */}
              <button
                onClick={shareProduct}
                className="absolute top-4 right-4 w-10 h-10 bg-background/80 hover:bg-background rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <Share2 size={20} />
              </button>
            </div>

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
                    src={`https://www.youtube.com/embed/${productData.youtubeUrl.split('v=')[1]}`}
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
              
              {/* Categories */}
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
                {language === 'es' ? 'Descripción general' : 'General Description'}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('product.sku')}</span>
                  <span className="font-semibold">{productData.sku}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('product.brand')}</span>
                  <Link to={`/catalogo?marca=${productData.brand}`} className="font-semibold text-primary hover:underline">
                    {productData.brand}
                  </Link>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('product.stock')}</span>
                  <span className="font-semibold">{productData.stock ?? 1} {language === 'es' ? 'Disponible' : 'Available'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('product.location')}</span>
                  <span className="font-semibold">{productData.branch ?? productData.location}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{language === 'es' ? 'Sucursal' : 'Branch'}</span>
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
                    <span className="text-muted-foreground">{t('product.price')}</span>
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
                {language === 'es' ? 'Cotizar envío' : 'Quote Shipping'}
              </Button>

              {/* Auction Section (if product is in auction) */}
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

              {/* Action Buttons - Different based on product type */}
              <div className="mt-6 space-y-3">
                {/* Normal product with price (not auction) */}
                {!(productData as any).is_auction && productData.price && !(productData as any).contact_for_quote ? (
                  <>
                    <div className="flex gap-3">
                      <Button className="flex-1 btn-gold" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2" size={18} />
                        {t('common.addToCart')}
                      </Button>
                      <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={handleBuyNow}>
                        {t('common.buyNow')}
                      </Button>
                    </div>
                    {/* Make Offer button - for logged in users */}
                    <Button 
                      className="w-full btn-offer"
                      onClick={() => setOfferDialogOpen(true)}
                    >
                      <DollarSign size={18} className="mr-2" />
                      {t('product.makeOffer')}
                    </Button>
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
                  /* Product requires quote - no price */
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Button className="flex-1" variant="outline" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2" size={18} />
                        {t('common.addToCart')}
                      </Button>
                      <Button className="flex-1 btn-gold" onClick={handleQuoteRequest}>
                        {t('common.requestQuote')}
                      </Button>
                    </div>
                    {/* Make Offer button - still available */}
                    <Button 
                      className="w-full btn-offer"
                      onClick={() => setOfferDialogOpen(true)}
                    >
                      <DollarSign size={18} className="mr-2" />
                      {t('product.makeOffer')}
                    </Button>
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
                  /* Fallback for normal products */
                  <div className="flex gap-3">
                    <Button className="flex-1" onClick={handleAddToCart}>
                      <ShoppingCart className="mr-2" size={18} />
                      {t('common.addToCart')}
                    </Button>
                    <Button className="flex-1 btn-gold" onClick={handleQuoteRequest}>
                      <MessageCircle className="mr-2" size={18} />
                      {t('common.requestQuote')}
                    </Button>
                  </div>
                ) : null}

                {/* For auction products - show make offer below auction section */}
                {(productData as any).is_auction && (
                  <>
                    <Button 
                      className="w-full btn-offer"
                      onClick={() => setOfferDialogOpen(true)}
                    >
                      <DollarSign size={18} className="mr-2" />
                      {language === 'es' ? 'Hacer una oferta directa' : 'Make a direct offer'}
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
                  {language === 'es' ? 'Compra con confianza' : 'Buy with Confidence'}
                </h3>
                <div className="space-y-4">
                  {/* Publicación Oficial de Mercado Industrial - solo cuando seller_id es null */}
                  {!(productData as any).seller_id && (
                    <div className="flex gap-3 bg-primary/5 rounded-xl p-3 border border-primary/20">
                      <div className="shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Award size={20} className="text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-2">
                          {language === 'es' ? 'Publicación Oficial de Mercado Industrial' : 'Official Mercado Industrial Listing'}
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            {language === 'es' ? 'Certificada' : 'Certified'}
                          </Badge>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'es' 
                            ? 'Este producto es publicado directamente por Mercado Industrial, garantizando autenticidad, calidad y soporte directo.'
                            : 'This product is published directly by Mercado Industrial, guaranteeing authenticity, quality, and direct support.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Programa de vendedor sobresaliente */}
                  <div className="flex gap-3">
                    <div className="shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <BadgeCheck size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {language === 'es' ? 'Programa de vendedor Sobresaliente' : 'Outstanding Seller Program'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'es' ? 'Vendedor confiable, envío rápido y devoluciones fáciles.' : 'Reliable seller, fast shipping and easy returns.'}{' '}
                        <Link to="/como-comprar" className="text-foreground underline hover:text-primary">
                          {language === 'es' ? 'Más información' : 'Learn more'}
                        </Link>
                      </p>
                    </div>
                  </div>

                  {/* Devolución de tu dinero */}
                  <div className="flex gap-3">
                    <div className="shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <ShieldCheck size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {language === 'es' ? 'Devolución de tu dinero de Mercado Industrial' : 'Mercado Industrial Money Back Guarantee'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'es' ? 'Recibe el artículo que pediste o te devolvemos tu dinero.' : 'Get the item you ordered or get your money back.'}{' '}
                        <Link to="/politicas-de-pago" className="text-foreground underline hover:text-primary">
                          {language === 'es' ? 'Más información' : 'Learn more'}
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {productData.description && (
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                  <Package size={20} className="text-primary" />
                  {t('product.specifications')}
                </h2>
                
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                  {productData.description}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* FAQs Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title mb-2">
                {language === 'es' ? 'Preguntas y Respuestas' : 'Questions & Answers'}
              </h2>
              <p className="text-muted-foreground">
                {faqs.length} {language === 'es' ? 'preguntas sobre este producto' : 'questions about this product'}
              </p>
            </div>
            <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gold">
                  <MessageCircle className="mr-2" size={18} />
                  {t('product.askQuestion')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('product.askQuestion')}</DialogTitle>
                  <DialogDescription>
                    {language === 'es' 
                      ? 'Tu pregunta será respondida por el vendedor y quedará visible para otros compradores.'
                      : 'Your question will be answered by the seller and will be visible to other buyers.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">{language === 'es' ? 'Tu pregunta' : 'Your question'}</Label>
                    <Textarea
                      id="question"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder={language === 'es' ? 'Escribe tu pregunta sobre este producto...' : 'Write your question about this product...'}
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleSubmitQuestion} className="w-full btn-gold">
                    <Send size={18} className="mr-2" />
                    {language === 'es' ? 'Enviar pregunta' : 'Send question'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow-card"
              >
                {/* Question */}
                <div className="flex gap-4 mb-4">
                  <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{faq.author}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        {faq.date}
                      </span>
                    </div>
                    <p className="text-foreground">{faq.question}</p>
                  </div>
                </div>

                {/* Answer */}
                {faq.answer ? (
                  <div className="ml-14 pl-4 border-l-2 border-primary/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary">{faq.answeredBy}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        {faq.answeredDate}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{faq.answer}</p>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mt-2 transition-colors">
                      <ThumbsUp size={14} />
                      Útil
                    </button>
                  </div>
                ) : (
                  <div className="ml-14 pl-4 border-l-2 border-muted">
                    <p className="text-muted-foreground italic">
                      {language === 'es' ? 'Esperando respuesta del vendedor...' : 'Waiting for seller response...'}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Seller Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="section-title mb-8">
            {language === 'es' ? 'Información del Vendedor' : 'Seller Information'}
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
