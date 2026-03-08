import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Calendar, User, Clock, ArrowLeft, Share2, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useBlogPost, useBlogPosts } from '@/hooks/useBlogPosts';

// Static blog posts data (fallback)
const staticBlogPosts: Record<string, {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
}> = {
  'mantenimiento-preventivo-maquinaria': {
    id: 'mantenimiento-preventivo-maquinaria',
    title: 'Guía completa de mantenimiento preventivo para maquinaria industrial',
    excerpt: 'Aprende las mejores prácticas para mantener tu equipo industrial en óptimas condiciones.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200',
    author: 'Equipo Mercado Industrial',
    date: '15 Enero 2025',
    readTime: '8 min',
    category: 'Mantenimiento',
    content: `## ¿Qué es el mantenimiento preventivo?\n\nEl mantenimiento preventivo es un conjunto de actividades programadas que se realizan de forma periódica para evitar fallos y averías en la maquinaria industrial.\n\n## Beneficios\n\n- **Reducción de costos**: Prevenir fallas es más económico que repararlas.\n- **Mayor vida útil**: Los equipos bien mantenidos duran más.\n- **Menos tiempo de inactividad**: Se reducen paradas no programadas.\n- **Seguridad mejorada**: Equipos en buen estado son más seguros.\n\n## Plan de mantenimiento básico\n\n### Inspecciones diarias\n- Verificar niveles de aceite y lubricantes\n- Revisar indicadores y alarmas\n- Inspeccionar conexiones y cables\n\n### Mantenimiento semanal\n- Limpieza general del equipo\n- Verificación de filtros\n- Revisión de sistemas de seguridad\n\n## Conclusión\n\nImplementar un programa de mantenimiento preventivo es una inversión que se traduce en ahorros significativos. En Mercado Industrial contamos con refacciones y equipos para mantener tu maquinaria en óptimas condiciones.`,
  },
  'como-elegir-quebradora': {
    id: 'como-elegir-quebradora',
    title: 'Cómo elegir la quebradora adecuada para tu operación minera',
    excerpt: 'Factores clave al seleccionar una quebradora para tu proyecto.',
    image: 'https://images.unsplash.com/photo-1578496479531-32e296d5c6e1?w=1200',
    author: 'Ing. Carlos Mendoza',
    date: '10 Enero 2025',
    readTime: '12 min',
    category: 'Minería',
    content: `## Introducción a las quebradoras\n\nLas quebradoras son equipos fundamentales en la industria minera y de agregados.\n\n## Tipos de quebradoras\n\n### Quebradora de quijada\nIdeal para trituración primaria de materiales duros.\n\n### Quebradora de cono\nPerfecta para trituración secundaria y terciaria.\n\n### Quebradora de impacto\nUtiliza el principio de impacto para reducir el material.\n\n## Factores a considerar\n\n- Tipo de material: Dureza, abrasividad y humedad\n- Capacidad requerida: Toneladas por hora\n- Tamaño de entrada y salida\n- Disponibilidad de refacciones\n\nEn Mercado Industrial tenemos disponible una amplia gama de quebradoras nuevas y usadas.`,
  },
  'tendencias-industria-2025': {
    id: 'tendencias-industria-2025',
    title: 'Tendencias de la industria manufacturera para 2025',
    excerpt: 'Las tecnologías que están transformando el sector industrial mexicano.',
    image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1200',
    author: 'Equipo Mercado Industrial',
    date: '5 Enero 2025',
    readTime: '6 min',
    category: 'Industria',
    content: `## El panorama industrial en 2025\n\nLa industria manufacturera mexicana está experimentando una transformación sin precedentes.\n\n## Principales tendencias\n\n### 1. Automatización inteligente\nLos sistemas inteligentes pueden adaptarse a diferentes tareas.\n\n### 2. Sostenibilidad\nLas empresas buscan reducir su huella de carbono.\n\n### 3. Nearshoring\nMéxico se beneficia del movimiento de empresas que buscan acercar sus operaciones a EE.UU.\n\n### 4. Mantenimiento predictivo\nEl uso de sensores e IA permite predecir fallas.\n\n### 5. Digitalización\nPlataformas como Mercado Industrial facilitan la compra y venta de maquinaria industrial.`,
  },
  'bandas-transportadoras-guia': {
    id: 'bandas-transportadoras-guia',
    title: 'Todo lo que necesitas saber sobre bandas transportadoras',
    excerpt: 'Tipos, aplicaciones, mantenimiento y selección de bandas transportadoras.',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200',
    author: 'Ing. Roberto López',
    date: '28 Diciembre 2024',
    readTime: '10 min',
    category: 'Equipos',
    content: `## Introducción\n\nLas bandas transportadoras son sistemas de transporte continuo esenciales en minería, manufactura y logística.\n\n## Tipos\n\n- **Caucho**: La más común, ideal para materiales a granel\n- **PVC**: Para aplicaciones alimenticias\n- **Acero**: Para altas temperaturas\n- **Modular**: Flexible y fácil de reparar\n\n## Mantenimiento básico\n\n- Inspeccionar la banda regularmente\n- Verificar tensión y alineación\n- Lubricar rodamientos\n- Limpiar acumulación de material\n\nEn Mercado Industrial encontrarás bandas transportadoras y componentes para cualquier aplicación.`,
  },
  'importacion-maquinaria-usa': {
    id: 'importacion-maquinaria-usa',
    title: 'Guía para importar maquinaria de Estados Unidos a México',
    excerpt: 'Proceso paso a paso para importar equipo industrial.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200',
    author: 'Equipo Mercado Industrial',
    date: '20 Diciembre 2024',
    readTime: '15 min',
    category: 'Comercio',
    content: `## Panorama general\n\nImportar maquinaria de EE.UU. puede ser una excelente opción para empresas mexicanas.\n\n## Beneficios del T-MEC\n\n- Reducción o eliminación de aranceles\n- Procesos aduanales simplificados\n- Mayor certeza jurídica\n\n## Proceso paso a paso\n\n- Identificar el equipo\n- Cotizar el flete\n- Clasificar arancelariamente\n- Calcular impuestos\n- Contratar agente aduanal\n- Coordinar transporte\n- Desaduanamiento\n- Entrega final\n\nMercado Industrial cuenta con ubicaciones en México y EE.UU. para facilitar tus operaciones.`,
  },
  'eficiencia-energetica-motores': {
    id: 'eficiencia-energetica-motores',
    title: 'Cómo mejorar la eficiencia energética de tus motores industriales',
    excerpt: 'Consejos prácticos para reducir el consumo energético.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
    author: 'Ing. Ana García',
    date: '15 Diciembre 2024',
    readTime: '7 min',
    category: 'Eficiencia',
    content: `## La importancia de la eficiencia energética\n\nLos motores eléctricos representan ~70% del consumo eléctrico industrial.\n\n## Estrategias\n\n### 1. Dimensionamiento correcto\nUn motor sobredimensionado opera por debajo de su eficiencia óptima.\n\n### 2. Variadores de frecuencia\nReducen el consumo hasta un 50% en aplicaciones variables.\n\n### 3. Mantenimiento preventivo\n- Mantener devanados limpios\n- Verificar alineación\n- Lubricar rodamientos\n\n### 4. Reemplazo de motores antiguos\nLos motores modernos son significativamente más eficientes.\n\nEn Mercado Industrial ofrecemos motores de alta eficiencia para cualquier aplicación.`,
  },
};

const BlogDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // Try to fetch from DB first
  const { data: dbPost } = useBlogPost(id || '');
  const { data: dbPosts = [] } = useBlogPosts();
  
  const staticPost = id ? staticBlogPosts[id] : null;

  // Build display post from DB or static
  const displayPost = dbPost
    ? {
        title: dbPost.title,
        excerpt: dbPost.excerpt || '',
        image: dbPost.image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200',
        author: dbPost.author,
        date: new Date(dbPost.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
        readTime: dbPost.read_time || '5 min',
        category: dbPost.category || 'Industrial',
        content: dbPost.content || '',
      }
    : staticPost
    ? {
        title: staticPost.title,
        excerpt: staticPost.excerpt,
        image: staticPost.image,
        author: staticPost.author,
        date: staticPost.date,
        readTime: staticPost.readTime,
        category: staticPost.category,
        content: staticPost.content,
      }
    : {
        title: id ? id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Artículo',
        excerpt: 'Contenido informativo sobre temas industriales y de maquinaria.',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200',
        author: 'Equipo Mercado Industrial',
        date: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
        readTime: '5 min',
        category: 'Industrial',
        content: '## Información en desarrollo\n\nEste artículo está siendo preparado por nuestro equipo editorial. Pronto tendremos contenido completo sobre este tema.\n\nTe invitamos a explorar otros artículos de nuestro blog o visitar nuestro catálogo de productos industriales.',
      };

  const handleShare = async () => {
    try {
      await navigator.share({ title: displayPost.title, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Enlace copiado', description: 'El enlace del artículo se copió al portapapeles' });
    }
  };

  // Related posts: mix DB + static, exclude current
  const relatedPosts = [
    ...dbPosts.filter(p => p.slug !== id).map(p => ({
      id: p.slug,
      title: p.title,
      image: p.image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
      category: p.category || 'Industrial',
      readTime: p.read_time || '5 min',
    })),
    ...Object.values(staticBlogPosts).filter(p => p.id !== id).map(p => ({
      id: p.id,
      title: p.title,
      image: p.image,
      category: p.category,
      readTime: p.readTime,
    })),
  ].slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img src={displayPost.image} alt={displayPost.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <article className="container mx-auto px-4 -mt-32 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft size={18} /> Volver al blog
            </Link>

            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-card mb-8">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">{displayPost.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">{displayPost.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{displayPost.excerpt}</p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-t pt-6">
                <span className="flex items-center gap-2"><User size={16} />{displayPost.author}</span>
                <span className="flex items-center gap-2"><Calendar size={16} />{displayPost.date}</span>
                <span className="flex items-center gap-2"><Clock size={16} />{displayPost.readTime} de lectura</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-card prose prose-lg max-w-none">
              {displayPost.content?.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) return <h2 key={index} className="text-2xl font-display font-bold text-foreground mt-8 mb-4 first:mt-0">{paragraph.replace('## ', '')}</h2>;
                if (paragraph.startsWith('### ')) return <h3 key={index} className="text-xl font-display font-semibold text-foreground mt-6 mb-3">{paragraph.replace('### ', '')}</h3>;
                if (paragraph.startsWith('- **')) {
                  const match = paragraph.match(/- \*\*(.+?)\*\*: (.+)/);
                  if (match) return <li key={index} className="text-muted-foreground mb-2"><strong className="text-foreground">{match[1]}:</strong> {match[2]}</li>;
                }
                if (paragraph.startsWith('- ')) return <li key={index} className="text-muted-foreground mb-2">{paragraph.replace('- ', '')}</li>;
                if (paragraph.match(/^\d+\. \*\*/)) {
                  const match = paragraph.match(/^(\d+)\. \*\*(.+?)\*\*$/);
                  if (match) return <p key={index} className="text-muted-foreground mb-2"><strong className="text-foreground">{match[1]}. {match[2]}</strong></p>;
                }
                if (paragraph.trim() === '') return null;
                return <p key={index} className="text-muted-foreground mb-4 leading-relaxed">{paragraph}</p>;
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-8 p-6 bg-muted/50 rounded-2xl">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen size={18} />
                <span>¿Te fue útil este artículo?</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                  <Share2 size={16} /> Compartir
                </Button>
                <Button asChild size="sm" className="btn-gold">
                  <Link to="/catalogo-mi">Ver catálogo</Link>
                </Button>
              </div>
            </div>

            <div className="mt-12 mb-16">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">Sigue explorando</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map(relatedPost => (
                  <Link key={relatedPost.id} to={`/blog/${relatedPost.id}`} className="group flex gap-4 bg-card rounded-xl p-4 shadow-card hover:shadow-lg transition-all">
                    <img src={relatedPost.image} alt={relatedPost.title} className="w-24 h-24 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="mb-2 text-xs">{relatedPost.category}</Badge>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{relatedPost.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{relatedPost.readTime}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetalle;
