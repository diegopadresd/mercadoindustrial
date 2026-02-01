import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Send, Inbox } from 'lucide-react';
import { OfertasEnviadas } from '@/components/ofertas/OfertasEnviadas';
import { OfertasRecibidas } from '@/components/ofertas/OfertasRecibidas';

const MisOfertas = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isVendedor, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('enviadas');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-display font-bold mb-2">Mis Ofertas</h1>
            <p className="text-muted-foreground mb-8">
              Gestiona las ofertas que has enviado y recibido
            </p>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="enviadas" className="flex items-center gap-2">
                  <Send size={16} />
                  Ofertas Enviadas
                </TabsTrigger>
                <TabsTrigger value="recibidas" className="flex items-center gap-2">
                  <Inbox size={16} />
                  Ofertas Recibidas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="enviadas">
                <OfertasEnviadas userId={user?.id} />
              </TabsContent>

              <TabsContent value="recibidas">
                {isVendedor ? (
                  <OfertasRecibidas sellerId={user?.id} />
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Activa tu cuenta de vendedor
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Para recibir ofertas, necesitas ser vendedor y publicar productos.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MisOfertas;
