import { Helmet } from 'react-helmet-async';

interface ProductJsonLdProps {
  name: string;
  description: string;
  sku: string;
  brand: string;
  image: string;
  price?: number | null;
  url: string;
  availability?: 'InStock' | 'OutOfStock';
  condition?: 'NewCondition' | 'UsedCondition';
}

export const ProductJsonLd = ({
  name,
  description,
  sku,
  brand,
  image,
  price,
  url,
  availability = 'InStock',
  condition = 'UsedCondition',
}: ProductJsonLdProps) => {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description.substring(0, 500),
    sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    image,
    url,
    itemCondition: `https://schema.org/${condition}`,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'MXN',
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: 'Mercado Industrial',
      },
      ...(price && price > 0 ? { price: price.toString() } : {}),
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};
