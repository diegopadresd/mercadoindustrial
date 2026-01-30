import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductById } from '@/data/products';

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

const ProductoDetalle = () => {
  const { id } = useParams();
  const { toast } = useToast();
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

  // Get product data dynamically
  const productData = getProductById(id || '');

  // If product not found, redirect to catalog
  if (!productData) {
    return <Navigate to="/catalogo" replace />;
  }

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

  const handleSubmitOffer = () => {
    if (!offerAmount) return;
    
    toast({
      title: '¡Oferta enviada!',
      description: `Tu oferta de $${Number(offerAmount).toLocaleString('es-MX')} ha sido enviada al vendedor.`,
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
          Regresar al catálogo
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
              <h2 className="font-display font-bold text-xl mb-4">Descripción general</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Sku</span>
                  <span className="font-semibold">{productData.sku}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Marca</span>
                  <Link to={`/catalogo?marca=${productData.brand}`} className="font-semibold text-primary hover:underline">
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
                      ${productData.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {productData.price ? (
                  <>
                    <div className="flex gap-3">
                      <Button className="flex-1 btn-gold">
                        <ShoppingCart className="mr-2" size={18} />
                        Agregar al carrito
                      </Button>
                      <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                        Comprar ahora
                      </Button>
                    </div>
                    <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full btn-offer">
                          <DollarSign size={18} className="mr-2" />
                          Hacer una oferta
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Hacer una oferta</DialogTitle>
                          <DialogDescription>
                            Envía tu mejor oferta al vendedor. Recibirás una respuesta pronto.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="offer">Tu oferta (MXN)</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                              <Input
                                id="offer"
                                type="number"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(e.target.value)}
                                placeholder="0.00"
                                className="pl-8"
                              />
                            </div>
                          </div>
                          <Button onClick={handleSubmitOffer} className="w-full btn-gold">
                            Enviar oferta
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Button className="flex-1">
                      <ShoppingCart className="mr-2" size={18} />
                      Agregar al carrito
                    </Button>
                    <Button className="flex-1 btn-gold">
                      <MessageCircle className="mr-2" size={18} />
                      Cotizar ahora
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            {productData.description && (
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                  <Package size={20} className="text-primary" />
                  Especificaciones
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
              <h2 className="section-title mb-2">Preguntas y Respuestas</h2>
              <p className="text-muted-foreground">
                {faqs.length} preguntas sobre este producto
              </p>
            </div>
            <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gold">
                  <MessageCircle className="mr-2" size={18} />
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
                    <p className="text-muted-foreground italic">Esperando respuesta del vendedor...</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductoDetalle;
