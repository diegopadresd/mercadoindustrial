import { useCompare } from '@/contexts/CompareContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { generateProductUrl } from '@/lib/slugify';
import { PageMeta } from '@/components/seo/PageMeta';

const Comparar = () => {
  const { compareIds, removeCompare } = useCompare();
  const { formatPrice, language } = useLocale();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['compare-products', compareIds],
    queryFn: async () => {
      if (compareIds.length === 0) return [];
      const { data } = await supabase
        .from('products')
        .select('id, title, sku, brand, price, images, location, categories, is_new, stock, slug, model, year, hours_of_use, has_warranty, warranty_duration, contact_for_quote')
        .in('id', compareIds);
      const map = new Map((data || []).map(p => [p.id, p]));
      return compareIds.map(id => map.get(id)).filter(Boolean) as NonNullable<typeof data>[number][];
    },
    enabled: compareIds.length > 0,
  });

  const rows: { label: string; render: (p: typeof products[number]) => React.ReactNode }[] = [
    {
      label: language === 'es' ? 'Imagen' : 'Image',
      render: p => (
        <Link to={p.slug ? generateProductUrl(p.slug, p.id, true) : generateProductUrl(p.title, p.id)}>
          <img src={p.images?.[0] || '/placeholder.svg'} alt={p.title} className="w-full aspect-square object-cover rounded-xl" />
        </Link>
      ),
    },
    { label: language === 'es' ? 'Título' : 'Title', render: p => <span className="font-semibold">{p.title}</span> },
    { label: 'SKU', render: p => p.sku },
    { label: language === 'es' ? 'Marca' : 'Brand', render: p => p.brand },
    { label: language === 'es' ? 'Modelo' : 'Model', render: p => p.model || '—' },
    { label: language === 'es' ? 'Año' : 'Year', render: p => p.year || '—' },
    {
      label: language === 'es' ? 'Precio' : 'Price',
      render: p => p.contact_for_quote || !p.price
        ? <span className="text-secondary font-medium">{language === 'es' ? 'Cotizar' : 'Quote'}</span>
        : <span className="font-bold text-primary text-lg">{formatPrice(p.price)}</span>,
    },
    { label: language === 'es' ? 'Stock' : 'Stock', render: p => p.stock ?? 1 },
    { label: language === 'es' ? 'Ubicación' : 'Location', render: p => p.location || '—' },
    { label: language === 'es' ? 'Condición' : 'Condition', render: p => p.is_new ? (language === 'es' ? 'Nuevo' : 'New') : (language === 'es' ? 'Usado' : 'Used') },
    { label: language === 'es' ? 'Horas de uso' : 'Hours of Use', render: p => p.hours_of_use ? p.hours_of_use.toLocaleString() : '—' },
    { label: language === 'es' ? 'Garantía' : 'Warranty', render: p => p.has_warranty ? (p.warranty_duration || (language === 'es' ? 'Sí' : 'Yes')) : (language === 'es' ? 'No' : 'No') },
    {
      label: language === 'es' ? 'Categorías' : 'Categories',
      render: p => (p.categories || []).join(', ') || '—',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Comparar Productos" description="Compara productos lado a lado en Mercado Industrial." />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link to="/catalogo-mi" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft size={18} />
          {language === 'es' ? 'Regresar al catálogo' : 'Back to catalog'}
        </Link>

        <h1 className="font-display font-bold text-3xl mb-8">
          {language === 'es' ? 'Comparar Productos' : 'Compare Products'}
        </h1>

        {compareIds.length < 2 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">
              {language === 'es' ? 'Selecciona al menos 2 productos desde el catálogo para comparar.' : 'Select at least 2 products from the catalog to compare.'}
            </p>
            <Button asChild>
              <Link to="/catalogo-mi">{language === 'es' ? 'Ir al catálogo' : 'Go to catalog'}</Link>
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left p-3 bg-muted rounded-tl-xl w-[160px]" />
                  {products.map(p => (
                    <th key={p.id} className="p-3 bg-muted text-center relative">
                      <button
                        onClick={() => removeCompare(p.id)}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      >
                        <X size={16} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="p-3 font-medium text-sm text-muted-foreground whitespace-nowrap">{row.label}</td>
                    {products.map(p => (
                      <td key={p.id} className="p-3 text-center text-sm">{row.render(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Comparar;
