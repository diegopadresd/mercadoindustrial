import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  FileText,
  Loader2
} from 'lucide-react';

const Carrito = () => {
  const { items, isLoading, updateQuantity, removeFromCart, subtotal, hasItemsWithoutPrice, allItemsWithoutPrice } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Quote form state (for non-authenticated users)
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteData, setQuoteData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });

  const handleQuantityChange = async (productId: string, delta: number, currentQuantity: number) => {
    await updateQuantity(productId, currentQuantity + delta);
  };

  const handleRemove = async (productId: string) => {
    await removeFromCart(productId);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setIsProcessing(true);
    // TODO: Implement Mercado Pago checkout
    setTimeout(() => {
      setIsProcessing(false);
      alert('Mercado Pago integration pending - access token required');
    }, 1000);
  };

  const handleQuoteRequest = async () => {
    if (!user && !showQuoteForm) {
      setShowQuoteForm(true);
      return;
    }

    if (user) {
      // User is logged in, use their profile data
      setIsProcessing(true);
      // TODO: Create quote order
      setTimeout(() => {
        setIsProcessing(false);
        alert('Cotización enviada - Un vendedor se pondrá en contacto contigo');
      }, 1000);
    } else {
      // Use form data
      if (!quoteData.name || !quoteData.email) {
        alert('Por favor completa tu nombre y correo');
        return;
      }
      setIsProcessing(true);
      // TODO: Create quote order for guest
      setTimeout(() => {
        setIsProcessing(false);
        alert('Cotización enviada - Un vendedor se pondrá en contacto contigo');
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Tu Carrito
          </h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ShoppingCart className="mx-auto text-muted-foreground/30 mb-6" size={80} />
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-muted-foreground mb-8">
              Explora nuestro catálogo y agrega productos a tu carrito
            </p>
            <Button asChild className="btn-gold">
              <Link to="/catalogo">
                <ArrowLeft size={18} className="mr-2" />
                Ir al catálogo
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-card flex flex-col sm:flex-row gap-6"
                >
                  <Link to={`/productos/${item.productId}`} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full sm:w-32 h-32 object-cover rounded-xl"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/productos/${item.productId}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 mb-2">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="text-sm text-muted-foreground mb-4">
                      <span>SKU: {item.sku}</span>
                      <span className="mx-2">•</span>
                      <span>{item.brand}</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.productId, -1, item.quantity)}
                          className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, 1, item.quantity)}
                          className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        {item.price ? (
                          <span className="text-xl font-display font-bold text-primary">
                            ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-secondary">
                            Precio por cotizar
                          </span>
                        )}
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 text-primary hover:underline mt-4"
              >
                <ArrowLeft size={18} />
                Continuar comprando
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl p-6 shadow-card sticky top-32"
              >
                <h2 className="text-xl font-display font-bold text-foreground mb-6">
                  Resumen del pedido
                </h2>

                <div className="space-y-4 mb-6">
                  {!allItemsWithoutPrice && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Envío</span>
                    <span className="text-primary">Por cotizar</span>
                  </div>
                  {hasItemsWithoutPrice && (
                    <div className="flex items-start gap-2 p-3 bg-secondary/10 rounded-lg">
                      <FileText size={18} className="text-secondary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Algunos productos requieren cotización. Un vendedor te contactará con el precio.
                      </p>
                    </div>
                  )}
                  {!allItemsWithoutPrice && (
                    <div className="border-t border-border pt-4 flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">
                        ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quote Form for guests */}
                {showQuoteForm && !user && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 mb-6 p-4 bg-muted rounded-xl"
                  >
                    <h3 className="font-semibold">Tus datos para la cotización</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="quote-name">Nombre *</Label>
                        <Input
                          id="quote-name"
                          value={quoteData.name}
                          onChange={(e) => setQuoteData({ ...quoteData, name: e.target.value })}
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quote-email">Correo *</Label>
                        <Input
                          id="quote-email"
                          type="email"
                          value={quoteData.email}
                          onChange={(e) => setQuoteData({ ...quoteData, email: e.target.value })}
                          placeholder="tu@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quote-phone">Teléfono</Label>
                        <Input
                          id="quote-phone"
                          type="tel"
                          value={quoteData.phone}
                          onChange={(e) => setQuoteData({ ...quoteData, phone: e.target.value })}
                          placeholder="+52 123 456 7890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quote-company">Empresa</Label>
                        <Input
                          id="quote-company"
                          value={quoteData.company}
                          onChange={(e) => setQuoteData({ ...quoteData, company: e.target.value })}
                          placeholder="Nombre de tu empresa"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quote-notes">Notas</Label>
                        <Textarea
                          id="quote-notes"
                          value={quoteData.notes}
                          onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                          placeholder="Información adicional..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O <Link to="/auth" className="text-primary hover:underline">crea una cuenta</Link> para guardar tu información
                    </p>
                  </motion.div>
                )}

                {/* Main action button */}
                {allItemsWithoutPrice ? (
                  <Button 
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground mb-4"
                    onClick={handleQuoteRequest}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText size={18} className="mr-2" />
                    )}
                    Cotiza Ahora
                  </Button>
                ) : hasItemsWithoutPrice ? (
                  <>
                    <Button 
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground mb-2"
                      onClick={handleQuoteRequest}
                      disabled={isProcessing}
                    >
                      <FileText size={18} className="mr-2" />
                      Solicitar Cotización Completa
                    </Button>
                    <Button 
                      className="w-full btn-gold mb-4"
                      onClick={handleCheckout}
                      disabled={isProcessing}
                    >
                      <CreditCard size={18} className="mr-2" />
                      Comprar productos con precio
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="w-full btn-gold mb-4"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard size={18} className="mr-2" />
                    )}
                    Proceder al pago
                  </Button>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={`https://wa.me/526621680047?text=${encodeURIComponent(`Hola, quiero información sobre mi carrito con ${items.length} productos`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contactar por WhatsApp
                  </a>
                </Button>

                {/* Trust badges */}
                <div className="mt-8 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Package size={18} className="text-primary shrink-0" />
                    <span>Envíos a toda la República y USA</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Truck size={18} className="text-primary shrink-0" />
                    <span>Socios logísticos: Almex y DHL</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Carrito;
