import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBlogPosts } from '@/hooks/useBlogPosts';

// Static fallback posts
const staticPosts = [
  { id: 'mantenimiento-preventivo-maquinaria', slug: 'mantenimiento-preventivo-maquinaria', title: 'Guía completa de mantenimiento preventivo para maquinaria industrial', excerpt: 'Aprende las mejores prácticas para mantener tu equipo industrial en óptimas condiciones y extender su vida útil.', image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800', author: 'Equipo Mercado Industrial', created_at: '2025-01-15', read_time: '8 min', category: 'Mantenimiento' },
  { id: 'como-elegir-quebradora', slug: 'como-elegir-quebradora', title: 'Cómo elegir la quebradora adecuada para tu operación minera', excerpt: 'Factores clave a considerar al seleccionar una quebradora de quijada, cono o impacto para tu proyecto.', image_url: 'https://images.unsplash.com/photo-1578496479531-32e296d5c6e1?w=800', author: 'Ing. Carlos Mendoza', created_at: '2025-01-10', read_time: '12 min', category: 'Minería' },
  { id: 'tendencias-industria-2025', slug: 'tendencias-industria-2025', title: 'Tendencias de la industria manufacturera para 2025', excerpt: 'Las tecnologías y tendencias que están transformando el sector industrial mexicano este año.', image_url: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800', author: 'Equipo Mercado Industrial', created_at: '2025-01-05', read_time: '6 min', category: 'Industria' },
  { id: 'bandas-transportadoras-guia', slug: 'bandas-transportadoras-guia', title: 'Todo lo que necesitas saber sobre bandas transportadoras', excerpt: 'Tipos, aplicaciones, mantenimiento y cómo seleccionar la banda transportadora ideal para tu operación.', image_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800', author: 'Ing. Roberto López', created_at: '2024-12-28', read_time: '10 min', category: 'Equipos' },
  { id: 'importacion-maquinaria-usa', slug: 'importacion-maquinaria-usa', title: 'Guía para importar maquinaria de Estados Unidos a México', excerpt: 'Proceso paso a paso para importar equipo industrial, incluyendo aranceles, documentación y logística.', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800', author: 'Equipo Mercado Industrial', created_at: '2024-12-20', read_time: '15 min', category: 'Comercio' },
  { id: 'eficiencia-energetica-motores', slug: 'eficiencia-energetica-motores', title: 'Cómo mejorar la eficiencia energética de tus motores industriales', excerpt: 'Consejos prácticos para reducir el consumo energético y los costos operativos de tu planta.', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', author: 'Ing. Ana García', created_at: '2024-12-15', read_time: '7 min', category: 'Eficiencia' },
];

const Blog = () => {
  const { toast } = useToast();
  const { data: dbPosts = [] } = useBlogPosts();
  const [email, setEmail] = useState('');

  // Merge DB posts with static fallbacks (DB posts first)
  const allPosts = [
    ...dbPosts.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || '',
      image_url: p.image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
      author: p.author,
      created_at: p.created_at,
      read_time: p.read_time || '5 min',
      category: p.category || 'Industrial',
    })),
    ...staticPosts,
  ];

  const featuredPost = allPosts[0];
  const otherPosts = allPosts.slice(1);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return dateStr; }
  };

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes('@')) {
      toast({ title: 'Email inválido', description: 'Ingresa un correo electrónico válido', variant: 'destructive' });
      return;
    }
    toast({ title: '¡Suscrito!', description: 'Recibirás nuestras novedades en tu correo' });
    setEmail('');
  };

  const getPostLink = (post: typeof allPosts[0]) => {
    // DB posts use slug, static posts use id
    return `/blog/${post.slug || post.id}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Blog <span className="text-primary">Industrial</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Artículos, guías y noticias del sector industrial, minero y de construcción
          </p>
        </motion.div>

        {/* Featured Post */}
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
          <Link to={getPostLink(featuredPost)} className="group block bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-300">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
                <img src={featuredPost.image_url} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-primary/10 text-primary hover:bg-primary/20">{featuredPost.category}</Badge>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{featuredPost.title}</h2>
                <p className="text-muted-foreground mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><User size={16} />{featuredPost.author}</span>
                  <span className="flex items-center gap-2"><Calendar size={16} />{formatDate(featuredPost.created_at)}</span>
                  <span className="flex items-center gap-2"><Clock size={16} />{featuredPost.read_time}</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.article>

        {/* Other Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post, index) => (
            <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
              <Link to={getPostLink(post)} className="group block bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 h-full">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                  <h3 className="text-lg font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={14} />{formatDate(post.created_at)}</span>
                    <span className="flex items-center gap-1"><Clock size={14} />{post.read_time}</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">Suscríbete a nuestro boletín</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Recibe las últimas noticias, ofertas especiales y artículos directamente en tu correo</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubscribe()} className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={handleSubscribe} className="btn-gold whitespace-nowrap">
              Suscribirse
              <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
