import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Gavel, Timer, TrendingUp, Shield, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { generateProductUrl } from '@/lib/slugify';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const Subastas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch auction products
  const { data: auctions, isLoading } = useQuery({
    queryKey: ['auctions', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_auction', true)
        .eq('is_active', true);

      if (statusFilter === 'active') {
        query = query.eq('auction_status', 'active');
      } else if (statusFilter === 'scheduled') {
        query = query.eq('auction_status', 'inactive');
      } else if (statusFilter === 'ended') {
        query = query.in('auction_status', ['ended_valid', 'ended_invalid', 'sold']);
      }

      const { data, error } = await query.order('auction_end', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filteredAuctions = auctions?.filter(auction =>
    auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auction.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAuctionStatus = (auction: any) => {
    const now = new Date();
    const start = auction.auction_start ? new Date(auction.auction_start) : null;
    const end = auction.auction_end ? new Date(auction.auction_end) : null;

    if (auction.auction_status === 'sold') return { label: 'Vendida', color: 'bg-green-500' };
    if (auction.auction_status === 'ended_valid') return { label: 'Finalizada', color: 'bg-blue-500' };
    if (auction.auction_status === 'ended_invalid') return { label: 'Sin venta', color: 'bg-gray-500' };
    if (start && now < start) return { label: 'Próximamente', color: 'bg-amber-500' };
    if (start && end && now >= start && now <= end) return { label: 'En curso', color: 'bg-green-500' };
    return { label: 'Inactiva', color: 'bg-gray-400' };
  };

  const getTimeRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Finalizada';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 py-16 md:py-24">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
                <Gavel size={20} />
                <span className="font-semibold">Subastas Oficiales</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
                Subastas de Maquinaria Industrial
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8">
                Participa en nuestras subastas oficiales y consigue maquinaria industrial 
                de alta calidad a precios competitivos.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-8 bg-muted/50 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: 'Subastas Verificadas', desc: '100% seguras' },
                { icon: Timer, label: 'Tiempo Real', desc: 'Pujas en vivo' },
                { icon: TrendingUp, label: 'Mejores Precios', desc: 'Ofertas competitivas' },
                { icon: Gavel, label: 'Proceso Transparente', desc: 'Sin sorpresas' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b sticky top-0 bg-background z-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Buscar subastas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="active">En curso</SelectItem>
                    <SelectItem value="scheduled">Próximas</SelectItem>
                    <SelectItem value="ended">Finalizadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Auctions Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-4 animate-pulse">
                    <div className="aspect-video bg-muted rounded-xl mb-4" />
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredAuctions && filteredAuctions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAuctions.map((auction, idx) => {
                  const status = getAuctionStatus(auction);
                  const timeRemaining = getTimeRemaining(auction.auction_end);

                  return (
                    <motion.div
                      key={auction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link to={generateProductUrl(auction.title, auction.id)}>
                        <div className="bg-card rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300 group">
                          {/* Image */}
                          <div className="relative aspect-video overflow-hidden">
                            <img
                              src={auction.images?.[0] || '/placeholder.svg'}
                              alt={auction.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <Badge className={`absolute top-3 left-3 ${status.color}`}>
                              {status.label}
                            </Badge>
                            {timeRemaining && status.label === 'En curso' && (
                              <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                <Timer size={14} />
                                {timeRemaining}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <p className="text-xs text-primary font-semibold mb-1">{auction.brand}</p>
                            <h3 className="font-display font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {auction.title}
                            </h3>

                            <div className="flex items-center justify-between pt-3 border-t">
                              <div>
                                <p className="text-xs text-muted-foreground">Precio de compra</p>
                                <p className="font-bold text-primary text-lg">
                                  ${auction.auction_min_price?.toLocaleString('es-MX')}
                                </p>
                              </div>
                              <Button size="sm" className="btn-gold">
                                <Gavel size={14} className="mr-1" />
                                Pujar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gavel size={40} className="text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">No hay subastas disponibles</h3>
                <p className="text-muted-foreground mb-6">
                  Próximamente tendremos nuevas subastas. ¡Mantente atento!
                </p>
                <Link to="/catalogo">
                  <Button>Explorar Catálogo</Button>
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              ¿Tienes maquinaria para subastar?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Si tienes equipo industrial que deseas vender a través de nuestras subastas oficiales,
              contáctanos y te ayudaremos en el proceso.
            </p>
            <Link to="/contacto">
              <Button size="lg" className="btn-gold">
                Contactar para Subastar
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Subastas;
