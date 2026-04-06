import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedMachinery } from '@/components/home/FeaturedMachinery';
import { StatsSection } from '@/components/home/StatsSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { ProductsSection } from '@/components/home/ProductsSection';
import { HowToBuySection } from '@/components/home/HowToBuySection';
import { CTASection } from '@/components/home/CTASection';
import { ContactSection } from '@/components/home/ContactSection';

const SITE_URL = 'https://mercado.alcance.co';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mercado Industrial',
  url: SITE_URL,
  logo: `${SITE_URL}/logo-mercado-industrial.webp`,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+52-662-168-0047',
      contactType: 'customer service',
      areaServed: 'MX',
      availableLanguage: 'Spanish',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Hermosillo',
    addressRegion: 'Sonora',
    addressCountry: 'MX',
  },
  sameAs: [
    'https://www.facebook.com/mercadoindustrial',
    'https://www.instagram.com/mercadoindustrial',
    'https://www.linkedin.com/company/mercado-industrial',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mercado Industrial',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/catalogo-mi?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
      </Helmet>
      <Header />
      <main>
        <HeroSection />
        <FeaturedMachinery />
        <StatsSection />
        <CategoriesSection />
        <ProductsSection />
        <HowToBuySection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
