import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const CheckoutFailure = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Pago no completado
          </h1>

          <p className="text-muted-foreground mb-8">
            Hubo un problema al procesar tu pago. No se ha realizado ningún cargo. 
            Por favor, intenta de nuevo o utiliza otro método de pago.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="btn-gold">
              <Link to="/checkout">
                <RefreshCw size={18} className="mr-2" />
                Reintentar pago
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/carrito">
                <ArrowLeft size={18} className="mr-2" />
                Volver al carrito
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutFailure;
