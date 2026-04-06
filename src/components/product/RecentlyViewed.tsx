import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/products/ProductCard';
import { useLocale } from '@/contexts/LocaleContext';
import { Clock } from 'lucide-react';

interface RecentlyViewedProps {
  productIds: string[];
  currentProductId: string;
}

export const RecentlyViewed = ({ productIds, currentProductId }: RecentlyViewedProps) => {
  const { language } = useLocale();
  const filteredIds = productIds.filter(id => id !== currentProductId).slice(0, 6);

  const { data: products = [] } = useQuery({
    queryKey: ['recently-viewed', filteredIds],
    queryFn: async () => {
      if (filteredIds.length === 0) return [];
      const { data, error } = await supabase
        .from('products')
        .select('id, title, sku, brand, price, images, location, categories, is_new, is_featured, is_auction, auction_min_price, auction_end, contact_for_quote, allow_offers, stock, slug')
        .in('id', filteredIds)
        .eq('is_active', true);
      if (error) throw error;
      // Preserve order from filteredIds
      const map = new Map((data || []).map(p => [p.id, p]));
      return filteredIds.map(id => map.get(id)).filter(Boolean) as typeof data;
    },
    enabled: filteredIds.length > 0,
  });

  if (products.length === 0) return null;

  return (
    <section className="mt-16 mb-8">
      <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
        <Clock size={22} className="text-primary" />
        {language === 'es' ? 'Vistos recientemente' : 'Recently Viewed'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(p => (
          <ProductCard
            key={p.id}
            id={p.id}
            title={p.title}
            sku={p.sku}
            brand={p.brand}
            price={p.price}
            image={p.images?.[0] || '/placeholder.svg'}
            location={p.location || undefined}
            categories={p.categories || []}
            isNew={p.is_new ?? false}
            isFeatured={p.is_featured ?? false}
            isAuction={p.is_auction ?? false}
            auctionMinPrice={p.auction_min_price}
            auctionEnd={p.auction_end}
            contactForQuote={p.contact_for_quote ?? false}
            allowOffers={p.allow_offers ?? false}
            stock={p.stock ?? 1}
            slug={p.slug}
          />
        ))}
      </div>
    </section>
  );
};
