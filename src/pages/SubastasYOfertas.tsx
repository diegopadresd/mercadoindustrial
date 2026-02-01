import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Gavel, 
  Tag, 
  Clock, 
  Trophy,
  ArrowRight,
  CheckCircle2,
  Info,
  Timer,
  DollarSign,
  Package
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useOffers } from '@/hooks/useOffers';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const SubastasYOfertas = () => {
  const { user } = useAuth();
  
  // Fetch user's offers
  const { data: userOffers } = useOffers({ userId: user?.id });
  
  // Fetch active auction products
  const { data: auctionProducts } = useQuery({
    queryKey: ['auction-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_auction', true)
        .eq('is_active', true)
        .in('auction_status', ['scheduled', 'active'])
        .order('auction_end', { ascending: true })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Gavel className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-secondary-foreground mb-4">
                Subastas y Ofertas
              </h1>
              <p className="text-lg text-secondary-foreground/70">
                Aprovecha nuestro sistema de subastas y ofertas para conseguir mejores precios en maquinaria industrial.
              </p>
            </div>
          </div>
        </section>

        {/* Active Auctions Section */}
        {auctionProducts && auctionProducts.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                    <Timer className="text-primary" />
                    Subastas Activas
                  </h2>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/catalogo?subasta=true">Ver todas</Link>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctionProducts.map((product: any) => {
                    const auctionEnd = product.auction_end ? new Date(product.auction_end) : null;
                    const now = new Date();
                    const isActive = auctionEnd && now < auctionEnd;
                    
                    return (
                      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative aspect-[4/3] bg-muted">
                          <img 
                            src={product.images?.[0] || '/placeholder.svg'} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-2 right-2 bg-primary">
                            <Gavel size={12} className="mr-1" />
                            Subasta
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                            {product.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                            <span>Compra ya:</span>
                            <span className="font-bold text-primary">
                              ${product.auction_min_price?.toLocaleString('es-MX')}
                            </span>
                          </div>
                          {auctionEnd && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                              <Clock size={12} />
                              {isActive ? (
                                <span>Termina: {auctionEnd.toLocaleString('es-MX')}</span>
                              ) : (
                                <span className="text-destructive">Finalizada</span>
                              )}
                            </div>
                          )}
                          <Button asChild size="sm" className="w-full">
                            <Link to={`/producto/${product.id}`}>
                              Ver subasta
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* User's Offers Section */}
        {user && userOffers && userOffers.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                  <DollarSign className="text-primary" />
                  Mis Ofertas
                </h2>
                
                <div className="space-y-4">
                  {userOffers.map((offer: any) => (
                    <Card key={offer.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package size={20} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              Oferta: ${offer.offer_price?.toLocaleString('es-MX')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(offer.created_at).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            offer.status === 'accepted' ? 'default' : 
                            offer.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {offer.status === 'accepted' && 'Aceptada'}
                          {offer.status === 'rejected' && 'Rechazada'}
                          {offer.status === 'pending' && 'Pendiente'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Info Sections */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Gavel className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>¿Cómo funcionan las Subastas?</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-muted-foreground mb-4">
                      Las subastas son ventas especiales donde varios compradores compiten ofreciendo pujas por un producto. El comprador con la puja más alta al cierre gana el derecho de compra.
                    </p>
                    <ul className="space-y-2">
                      {[
                        'Crea una cuenta o inicia sesión en la plataforma',
                        'Busca productos marcados como "En subasta"',
                        'Revisa el precio actual y el tiempo restante',
                        'Ingresa tu puja (debe ser mayor a la puja actual)',
                        'O usa "Compra ya" para adquirirlo inmediatamente al precio fijado',
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl">
                    <Trophy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Ganador de la subasta</h4>
                      <p className="text-sm text-muted-foreground">
                        Al cierre, si la puja más alta alcanza el precio mínimo, el participante es declarado ganador y recibe una notificación. Si no se alcanza el mínimo, la subasta se declara inválida.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ofertas Section */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>¿Cómo funcionan las Ofertas?</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-muted-foreground mb-4">
                      En cualquier producto puedes usar el botón "Hacer oferta" para proponer un precio diferente al publicado. El vendedor evaluará tu propuesta.
                    </p>
                    <ul className="space-y-2">
                      {[
                        'Ingresa el monto que deseas ofrecer',
                        'Agrega un mensaje opcional para el vendedor',
                        'Envía tu oferta y espera la respuesta',
                        'Si es aceptada, recibirás una notificación para completar la compra',
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Nota legal */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Nota importante:</strong> Las pujas y ofertas son compromisos de compra. Participa de buena fe y verifica las condiciones de cada producto antes de ofertar.
                </AlertDescription>
              </Alert>

              {/* CTA */}
              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-6">
                  ¿Listo para encontrar ofertas increíbles en maquinaria industrial?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/catalogo">
                      Explorar catálogo
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                  {!user && (
                    <Button asChild variant="outline" size="lg">
                      <Link to="/auth">Crear cuenta</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SubastasYOfertas;
