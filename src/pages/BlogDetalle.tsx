import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Calendar, User, Clock, ArrowLeft, Share2, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Blog posts data - could be moved to a shared file or fetched from DB
const blogPosts: Record<string, {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  content?: string;
}> = {
  'mantenimiento-preventivo-maquinaria': {
    id: 'mantenimiento-preventivo-maquinaria',
    title: 'Guía completa de mantenimiento preventivo para maquinaria industrial',
    excerpt: 'Aprende las mejores prácticas para mantener tu equipo industrial en óptimas condiciones y extender su vida útil.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200',
    author: 'Equipo Mercado Industrial',
    date: '15 Enero 2025',
    readTime: '8 min',
    category: 'Mantenimiento',
    content: `
## ¿Qué es el mantenimiento preventivo?

El mantenimiento preventivo es un conjunto de actividades programadas que se realizan de forma periódica para evitar fallos y averías en la maquinaria industrial. A diferencia del mantenimiento correctivo, que se ejecuta cuando ya ha ocurrido una falla, el preventivo busca anticiparse a los problemas.

## Beneficios del mantenimiento preventivo

- **Reducción de costos**: Prevenir fallas es significativamente más económico que repararlas.
- **Mayor vida útil**: Los equipos bien mantenidos duran más tiempo.
- **Menos tiempo de inactividad**: Se reducen las paradas no programadas.
- **Seguridad mejorada**: Equipos en buen estado son más seguros para los operadores.
- **Eficiencia energética**: Máquinas bien mantenidas consumen menos energía.

## Plan de mantenimiento básico

### Inspecciones diarias
- Verificar niveles de aceite y lubricantes
- Revisar indicadores y alarmas
- Inspeccionar visualmente conexiones y cables
- Escuchar ruidos anormales

### Mantenimiento semanal
- Limpieza general del equipo
- Verificación de filtros
- Revisión de sistemas de seguridad
- Pruebas de funcionamiento

### Mantenimiento mensual
- Cambio de filtros si es necesario
- Lubricación de partes móviles
- Calibración de instrumentos
- Revisión de componentes eléctricos

## Documentación y registro

Es fundamental llevar un registro detallado de todas las actividades de mantenimiento. Esto permite:
- Identificar patrones de fallas
- Planificar mejor los recursos
- Cumplir con normativas de seguridad
- Tomar decisiones informadas sobre reemplazo de equipos

## Conclusión

Implementar un programa de mantenimiento preventivo es una inversión que se traduce en ahorros significativos a largo plazo. En Mercado Industrial contamos con una amplia selección de refacciones y equipos para ayudarte a mantener tu maquinaria en óptimas condiciones.
    `,
  },
  'como-elegir-quebradora': {
    id: 'como-elegir-quebradora',
    title: 'Cómo elegir la quebradora adecuada para tu operación minera',
    excerpt: 'Factores clave a considerar al seleccionar una quebradora de quijada, cono o impacto para tu proyecto.',
    image: 'https://images.unsplash.com/photo-1578496479531-32e296d5c6e1?w=1200',
    author: 'Ing. Carlos Mendoza',
    date: '10 Enero 2025',
    readTime: '12 min',
    category: 'Minería',
    content: `
## Introducción a las quebradoras

Las quebradoras son equipos fundamentales en la industria minera y de agregados. Seleccionar la quebradora correcta puede marcar la diferencia entre una operación rentable y una que presenta constantes problemas.

## Tipos de quebradoras

### Quebradora de quijada (mandíbula)
Ideal para trituración primaria de materiales duros y abrasivos. Funcionan mediante el movimiento de una mandíbula móvil contra una fija.

**Ventajas:**
- Alta capacidad de producción
- Bajo costo de operación
- Fácil mantenimiento

### Quebradora de cono
Perfecta para trituración secundaria y terciaria. Produce material de tamaño uniforme.

**Ventajas:**
- Excelente forma del producto
- Alta eficiencia
- Ideal para materiales duros

### Quebradora de impacto
Utiliza el principio de impacto para reducir el material. Ideal para materiales menos abrasivos.

**Ventajas:**
- Produce material cúbico
- Alta reducción
- Versátil

## Factores a considerar

1. **Tipo de material**: Dureza, abrasividad y humedad
2. **Capacidad requerida**: Toneladas por hora
3. **Tamaño de entrada y salida**: Granulometría deseada
4. **Disponibilidad de refacciones**: Costos y tiempos de entrega
5. **Consumo energético**: Eficiencia operativa

## Recomendaciones finales

Antes de invertir en una quebradora, te recomendamos:
- Analizar muestras de tu material
- Consultar con expertos
- Visitar operaciones similares
- Considerar el costo total de propiedad

En Mercado Industrial tenemos disponible una amplia gama de quebradoras nuevas y usadas para todo tipo de aplicaciones.
    `,
  },
  'tendencias-industria-2025': {
    id: 'tendencias-industria-2025',
    title: 'Tendencias de la industria manufacturera para 2025',
    excerpt: 'Las tecnologías y tendencias que están transformando el sector industrial mexicano este año.',
    image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1200',
    author: 'Equipo Mercado Industrial',
    date: '5 Enero 2025',
    readTime: '6 min',
    category: 'Industria',
    content: `
## El panorama industrial en 2025

La industria manufacturera mexicana está experimentando una transformación sin precedentes. Las nuevas tecnologías y las demandas del mercado global están redefiniendo cómo operan las plantas industriales.

## Principales tendencias

### 1. Automatización inteligente
La automatización va más allá de los robots tradicionales. Los sistemas inteligentes pueden adaptarse a diferentes tareas y aprender de su entorno.

### 2. Sostenibilidad y eficiencia energética
Las empresas buscan reducir su huella de carbono mientras mantienen la competitividad. Esto incluye:
- Energías renovables
- Optimización de procesos
- Economía circular

### 3. Nearshoring
México se beneficia del movimiento de empresas que buscan acercar sus operaciones a Estados Unidos. Esto genera demanda de:
- Maquinaria moderna
- Talento capacitado
- Infraestructura logística

### 4. Mantenimiento predictivo
El uso de sensores e inteligencia artificial permite predecir fallas antes de que ocurran, reduciendo tiempos muertos.

### 5. Digitalización de la cadena de suministro
Plataformas como Mercado Industrial facilitan la compra y venta de maquinaria industrial, conectando compradores y vendedores de manera eficiente.

## Conclusión

Las empresas que adopten estas tendencias estarán mejor posicionadas para competir en el mercado global. En Mercado Industrial estamos comprometidos con apoyar la modernización de la industria mexicana.
    `,
  },
  'bandas-transportadoras-guia': {
    id: 'bandas-transportadoras-guia',
    title: 'Todo lo que necesitas saber sobre bandas transportadoras',
    excerpt: 'Tipos, aplicaciones, mantenimiento y cómo seleccionar la banda transportadora ideal para tu operación.',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200',
    author: 'Ing. Roberto López',
    date: '28 Diciembre 2024',
    readTime: '10 min',
    category: 'Equipos',
    content: `
## Introducción a las bandas transportadoras

Las bandas transportadoras son sistemas de transporte continuo que mueven materiales de un punto a otro. Son esenciales en minería, manufactura, logística y muchos otros sectores.

## Tipos de bandas transportadoras

### Por material de la banda
- **Caucho**: La más común, ideal para materiales a granel
- **PVC**: Para aplicaciones alimenticias e industriales ligeras
- **Acero**: Para altas temperaturas y materiales cortantes
- **Modular**: Flexible y fácil de reparar

### Por configuración
- **Plana**: Transporte horizontal o con poca inclinación
- **Artesa**: Para materiales a granel, evita derrames
- **Inclinada**: Con cleats o perfiles para evitar deslizamiento
- **Curva**: Para cambios de dirección

## Componentes principales

1. **Banda**: El elemento que transporta el material
2. **Rodillos**: Soportan y guían la banda
3. **Tambores**: Impulsan y tensan la banda
4. **Estructura**: Marco que soporta todo el sistema
5. **Motor**: Proporciona la potencia

## Mantenimiento básico

- Inspeccionar la banda regularmente por desgaste o daños
- Verificar la tensión y alineación
- Lubricar rodamientos según el programa
- Limpiar acumulación de material
- Revisar sistemas de seguridad

## Cómo seleccionar la banda correcta

Considera estos factores:
- Tipo y peso del material a transportar
- Distancia y diferencia de altura
- Velocidad requerida
- Condiciones ambientales
- Normativas aplicables

En Mercado Industrial encontrarás bandas transportadoras y componentes para cualquier aplicación industrial.
    `,
  },
  'importacion-maquinaria-usa': {
    id: 'importacion-maquinaria-usa',
    title: 'Guía para importar maquinaria de Estados Unidos a México',
    excerpt: 'Proceso paso a paso para importar equipo industrial, incluyendo aranceles, documentación y logística.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200',
    author: 'Equipo Mercado Industrial',
    date: '20 Diciembre 2024',
    readTime: '15 min',
    category: 'Comercio',
    content: `
## Panorama general

Importar maquinaria de Estados Unidos puede ser una excelente opción para empresas mexicanas que buscan equipo de calidad a precios competitivos. Sin embargo, es importante conocer el proceso para evitar contratiempos.

## Beneficios del T-MEC

El Tratado entre México, Estados Unidos y Canadá (T-MEC) ofrece ventajas significativas:
- Reducción o eliminación de aranceles
- Procesos aduanales simplificados
- Mayor certeza jurídica

## Documentación requerida

### Documentos básicos
- Factura comercial
- Pedimento de importación
- Certificado de origen (para beneficios del T-MEC)
- Bill of Lading o carta porte

### Para maquinaria usada
- Carta de no producción nacional (si aplica)
- Certificado de inspección previa
- Historial de mantenimiento (recomendado)

## Proceso paso a paso

1. **Identificar el equipo**: Características, condición, ubicación
2. **Cotizar el flete**: Terrestre, marítimo o aéreo
3. **Clasificar arancelariamente**: Determinar la fracción arancelaria
4. **Calcular impuestos**: Arancel, IVA, DTA
5. **Contratar agente aduanal**: Obligatorio para importaciones
6. **Coordinar el transporte**: Desde el origen hasta tu planta
7. **Desaduanamiento**: Proceso en la aduana mexicana
8. **Entrega final**: Recepción e instalación

## Costos a considerar

- Precio del equipo
- Flete internacional
- Seguro de transporte
- Aranceles e impuestos
- Honorarios del agente aduanal
- Flete nacional
- Instalación y puesta en marcha

## Consejos prácticos

- Verifica la reputación del vendedor
- Inspecciona el equipo antes de comprar
- Asegura adecuadamente el envío
- Planifica con anticipación
- Considera comprar en Mercado Industrial donde facilitamos el proceso

Mercado Industrial cuenta con 5 ubicaciones en México y Estados Unidos para facilitar tus operaciones de importación.
    `,
  },
  'eficiencia-energetica-motores': {
    id: 'eficiencia-energetica-motores',
    title: 'Cómo mejorar la eficiencia energética de tus motores industriales',
    excerpt: 'Consejos prácticos para reducir el consumo energético y los costos operativos de tu planta.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
    author: 'Ing. Ana García',
    date: '15 Diciembre 2024',
    readTime: '7 min',
    category: 'Eficiencia',
    content: `
## La importancia de la eficiencia energética

Los motores eléctricos representan aproximadamente el 70% del consumo eléctrico industrial. Mejorar su eficiencia puede traducirse en ahorros significativos.

## Clasificación de eficiencia

Los motores se clasifican según su eficiencia:
- **IE1**: Eficiencia estándar
- **IE2**: Alta eficiencia
- **IE3**: Eficiencia premium
- **IE4**: Eficiencia super premium

Cada nivel superior representa un 2-3% menos de pérdidas.

## Estrategias para mejorar la eficiencia

### 1. Dimensionamiento correcto
Un motor sobredimensionado opera por debajo de su eficiencia óptima. Analiza la carga real y selecciona el motor adecuado.

### 2. Variadores de frecuencia
Los VFDs ajustan la velocidad del motor según la demanda, reduciendo el consumo hasta un 50% en aplicaciones variables.

### 3. Mantenimiento preventivo
- Mantén los devanados limpios
- Verifica la alineación
- Lubrica los rodamientos
- Revisa conexiones eléctricas

### 4. Corrección del factor de potencia
Un bajo factor de potencia incrementa las pérdidas. Usa capacitores para corregirlo.

### 5. Reemplazo de motores antiguos
Los motores modernos son significativamente más eficientes. Calcula el retorno de inversión.

## Cálculo del ahorro potencial

Fórmula básica:
Ahorro anual = Potencia × Horas × (1/η1 - 1/η2) × Costo kWh

Donde:
- η1 = Eficiencia del motor actual
- η2 = Eficiencia del motor nuevo

## Incentivos disponibles

Consulta con CFE y FIDE sobre programas de apoyo para proyectos de eficiencia energética.

## Conclusión

Invertir en eficiencia energética no solo reduce costos, también contribuye a la sustentabilidad. En Mercado Industrial ofrecemos motores de alta eficiencia para cualquier aplicación.
    `,
  },
};

const BlogDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const post = id ? blogPosts[id] : null;

  // Generate generic content if post doesn't exist
  const genericPost = {
    id: id || 'articulo',
    title: id ? id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Artículo',
    excerpt: 'Contenido informativo sobre temas industriales y de maquinaria.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200',
    author: 'Equipo Mercado Industrial',
    date: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
    readTime: '5 min',
    category: 'Industrial',
    content: `
## Información en desarrollo

Este artículo está siendo preparado por nuestro equipo editorial. Pronto tendremos contenido completo y detallado sobre este tema.

## Mientras tanto

Te invitamos a explorar otros artículos de nuestro blog o visitar nuestro catálogo de productos industriales.

### ¿Necesitas información específica?

Si buscas información sobre algún tema en particular relacionado con:
- Maquinaria industrial
- Mantenimiento de equipos
- Minería y construcción
- Importación y logística

No dudes en contactarnos. Nuestro equipo de expertos estará encantado de ayudarte.

## Visita nuestro catálogo

Contamos con más de 12,000 productos disponibles en categorías como:
- Quebradoras y trituradoras
- Motores eléctricos
- Bandas transportadoras
- Compresores
- Y mucho más

En Mercado Industrial somos tu aliado para encontrar el equipo que necesitas.
    `,
  };

  const displayPost = post || genericPost;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src={displayPost.image}
            alt={displayPost.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Content */}
        <article className="container mx-auto px-4 -mt-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            {/* Back link */}
            <Link 
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              Volver al blog
            </Link>

            {/* Article header */}
            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-card mb-8">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                {displayPost.category}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                {displayPost.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6">
                {displayPost.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-t pt-6">
                <span className="flex items-center gap-2">
                  <User size={16} />
                  {displayPost.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {displayPost.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  {displayPost.readTime} de lectura
                </span>
              </div>
            </div>

            {/* Article content */}
            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-card prose prose-lg max-w-none">
              {displayPost.content?.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl font-display font-bold text-foreground mt-8 mb-4 first:mt-0">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-xl font-display font-semibold text-foreground mt-6 mb-3">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('- **')) {
                  const match = paragraph.match(/- \*\*(.+?)\*\*: (.+)/);
                  if (match) {
                    return (
                      <li key={index} className="text-muted-foreground mb-2">
                        <strong className="text-foreground">{match[1]}:</strong> {match[2]}
                      </li>
                    );
                  }
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <li key={index} className="text-muted-foreground mb-2">
                      {paragraph.replace('- ', '')}
                    </li>
                  );
                }
                if (paragraph.match(/^\d+\. \*\*/)) {
                  const match = paragraph.match(/^(\d+)\. \*\*(.+?)\*\*$/);
                  if (match) {
                    return (
                      <p key={index} className="text-muted-foreground mb-2">
                        <strong className="text-foreground">{match[1]}. {match[2]}</strong>
                      </p>
                    );
                  }
                }
                if (paragraph.trim() === '') {
                  return null;
                }
                return (
                  <p key={index} className="text-muted-foreground mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Share & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-8 p-6 bg-muted/50 rounded-2xl">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen size={18} />
                <span>¿Te fue útil este artículo?</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 size={16} />
                  Compartir
                </Button>
                <Button asChild size="sm" className="btn-gold">
                  <Link to="/catalogo">Ver catálogo</Link>
                </Button>
              </div>
            </div>

            {/* Related posts suggestion */}
            <div className="mt-12 mb-16">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                Sigue explorando
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.values(blogPosts)
                  .filter(p => p.id !== id)
                  .slice(0, 2)
                  .map(relatedPost => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.id}`}
                      className="group flex gap-4 bg-card rounded-xl p-4 shadow-card hover:shadow-lg transition-all"
                    >
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-24 h-24 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {relatedPost.category}
                        </Badge>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {relatedPost.readTime}
                        </p>
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
