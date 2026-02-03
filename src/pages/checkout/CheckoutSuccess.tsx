import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart on successful payment
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            ¡Pago exitoso!
          </h1>

          <p className="text-muted-foreground mb-8">
            Tu pago ha sido procesado correctamente. Recibirás un correo de confirmación con los detalles de tu pedido.
          </p>

          <div className="bg-card rounded-2xl p-6 shadow-card mb-8">
            <div className="flex items-center justify-center gap-3 text-primary mb-4">
              <Package size={24} />
              <span className="font-semibold">Pedido confirmado</span>
            </div>
            {orderId && (
              <p className="text-sm text-muted-foreground">
                ID de pedido: <span className="font-mono">{orderId.slice(0, 8)}...</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="btn-gold">
              <Link to="/mi-cuenta/mis-compras">
                Ver mis compras
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/catalogo">
                Seguir comprando
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
