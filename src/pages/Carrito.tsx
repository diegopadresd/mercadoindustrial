import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { QuoteOptionsDialog } from '@/components/cart/QuoteOptionsDialog';
import { generateProductUrl } from '@/lib/slugify';
import {
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  FileText,
  Loader2,
  MessageCircle
} from 'lucide-react';

const Carrito = () => {
  const { items, isLoading, updateQuantity, removeFromCart, subtotal, hasItemsWithoutPrice, allItemsWithoutPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);

  const handleQuantityChange = async (productId: string, delta: number, currentQuantity: number) => {
    await updateQuantity(productId, currentQuantity + delta);
  };

  const handleRemove = async (productId: string) => {
    await removeFromCart(productId);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/checkout');
  };

  const handleQuoteRequest = () => {
    setQuoteDialogOpen(true);
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
              <Link to="/catalogo-mi">
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
                  <Link to={generateProductUrl(item.slug || item.title, item.productId, !!item.slug)} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full sm:w-32 h-32 object-cover rounded-xl"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={generateProductUrl(item.slug || item.title, item.productId, !!item.slug)}>
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
                to="/catalogo-mi"
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
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Envío</span>
                      <span className="text-secondary font-medium">Flete no incluido</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Puedes obtener una estimación de precio con nuestro{' '}
                      <Link to="/cotizador" className="text-primary hover:underline font-medium">
                        Cotizador
                      </Link>
                    </p>
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

                {/* Removed old quote form - using dialog now */}

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

      {/* Quote Options Dialog */}
      <QuoteOptionsDialog 
        open={quoteDialogOpen} 
        onOpenChange={setQuoteDialogOpen}
        items={items}
      />
    </div>
  );
};

export default Carrito;
