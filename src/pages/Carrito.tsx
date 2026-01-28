import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft,
  Package,
  CreditCard,
  Truck
} from 'lucide-react';

// Mock cart items - in a real app this would come from state/context
const initialCartItems = [
  {
    id: 'rodillo-retorno-24',
    title: 'Rodillo de retorno para banda de 24" marca MI COMPONENTS',
    sku: 'ROD-097',
    brand: 'MI COMPONENTS',
    price: 1657.00,
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/09/ROD-097_Rodillo_2_a_med_thumb.webp',
    quantity: 1,
  },
];

const Carrito = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Free shipping or calculated
  const total = subtotal + shipping;

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
            {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
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
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-card flex flex-col sm:flex-row gap-6"
                >
                  <Link to={`/productos/${item.id}`} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full sm:w-32 h-32 object-cover rounded-xl"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/productos/${item.id}`}>
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
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-display font-bold text-primary">
                          ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
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
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Envío</span>
                    <span className="text-primary">Por cotizar</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">
                      ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <Button className="w-full btn-gold mb-4">
                  <CreditCard size={18} className="mr-2" />
                  Proceder al pago
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <a
                    href="https://wa.me/526621680047?text=Hola,%20quiero%20solicitar%20cotización%20de%20mi%20carrito"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Solicitar cotización por WhatsApp
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
