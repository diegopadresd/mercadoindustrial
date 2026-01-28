import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { PartnersSection } from '@/components/home/PartnersSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { MIComponentsSection } from '@/components/home/MIComponentsSection';
import { ProductsSection } from '@/components/home/ProductsSection';
import { HowToBuySection } from '@/components/home/HowToBuySection';
import { SectorsSection } from '@/components/home/SectorsSection';
import { ContactSection } from '@/components/home/ContactSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PartnersSection />
        <CategoriesSection />
        <MIComponentsSection />
        <ProductsSection />
        <HowToBuySection />
        <SectorsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
