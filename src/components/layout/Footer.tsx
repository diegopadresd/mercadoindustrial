import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Store, CreditCard, Building2 } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const locations = [
  {
    city: 'Hermosillo',
    mapUrl: 'https://www.google.com/maps/place/Mercado+Industrial+Hermosillo/@29.0572594,-110.9295005,17z',
  },
  {
    city: 'Mexicali',
    mapUrl: 'https://www.google.com/maps/place/Mexicali,+Baja+California',
  },
  {
    city: 'Santa Catarina',
    mapUrl: 'https://www.google.com/maps/place/Mercado+Industrial+Santa+Catarina/@25.7212736,-100.5028245,17z',
  },
  {
    city: 'Tijuana',
    mapUrl: 'https://www.google.com/maps/place/Tijuana,+Baja+California',
  },
  {
    city: 'Nogales, AZ',
    mapUrl: 'https://www.google.com/maps/place/Nogales,+AZ',
  },
];

const sectors = [
  { name: 'Industrial', href: '/catalogo?sector=industrial' },
  { name: 'Minería', nameEn: 'Mining', href: '/catalogo?sector=mineria' },
  { name: 'Construcción', nameEn: 'Construction', href: '/catalogo?sector=construccion' },
  { name: 'Alimenticio', nameEn: 'Food Industry', href: '/catalogo?sector=alimenticio' },
  { name: 'Eléctrico', nameEn: 'Electrical', href: '/catalogo?sector=electrico' },
  { name: 'Agroindustria', nameEn: 'Agribusiness', href: '/catalogo?sector=agroindustria' },
];

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { language, t } = useLocale();

  const quickLinks = language === 'es' ? [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/catalogo' },
    { name: 'Marcas', href: '/marcas' },
    { name: 'Blog', href: '/blog' },
    { name: 'Quiénes Somos', href: '/nosotros' },
    { name: 'Vende con Nosotros', href: '/como-vender' },
  ] : [
    { name: 'Home', href: '/' },
    { name: 'Catalog', href: '/catalogo' },
    { name: 'Brands', href: '/marcas' },
    { name: 'Blog', href: '/blog' },
    { name: 'About Us', href: '/nosotros' },
    { name: 'Sell with Us', href: '/como-vender' },
  ];

  const helpLinks = language === 'es' ? [
    { name: 'Preguntas frecuentes', href: '/faq' },
    { name: 'Cómo vender con nosotros', href: '/como-vender' },
    { name: 'Cómo comprar con nosotros', href: '/como-comprar' },
    { name: 'Subastas y ofertas', href: '/subastas-y-ofertas' },
    { name: 'Políticas de pago', href: '/politicas-de-pago' },
  ] : [
    { name: 'FAQ', href: '/faq' },
    { name: 'How to sell with us', href: '/como-vender' },
    { name: 'How to buy with us', href: '/como-comprar' },
    { name: 'Auctions and offers', href: '/subastas-y-ofertas' },
    { name: 'Payment policies', href: '/politicas-de-pago' },
  ];
  return (
    <footer ref={ref} className="bg-secondary text-secondary-foreground">
      {/* Locations Section */}
      <div className="border-b border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-8">
          <h3 className="font-display font-bold text-secondary-foreground mb-4">
            {language === 'es' ? 'Nuestras ubicaciones' : 'Our Locations'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {locations.map((location) => (
              <a
                key={location.city}
                href={location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-secondary-foreground/80 hover:text-primary transition-colors"
              >
                <MapPin className="text-primary shrink-0" size={16} />
                <span>{location.city}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-display font-black text-primary">MERCADO</span>
              <span className="text-2xl font-display font-black text-secondary-foreground ml-2">INDUSTRIAL</span>
            </div>
            <p className="text-secondary-foreground/70 mb-6">
              {language === 'es' 
                ? 'E-Business con atención personalizada. Tu marketplace de confianza para maquinaria y equipo industrial.'
                : 'E-Business with personalized service. Your trusted marketplace for industrial machinery and equipment.'}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-secondary-foreground/10 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <Store size={14} className="text-primary" />
                <span className="text-xs text-secondary-foreground/80 font-medium">Terminal</span>
              </div>
              <div className="bg-secondary-foreground/10 rounded-lg px-3 py-2">
                <img src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/6.6.73/mercadopago/logo__large.png" alt="Mercado Pago" className="h-5" />
              </div>
              <a
                href="https://www.paypal.com/paypalme/mercadoindustrial"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary-foreground/10 hover:bg-secondary-foreground/20 rounded-lg px-3 py-2 transition-colors"
              >
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-5" />
              </a>
              <div className="bg-secondary-foreground/10 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <CreditCard size={14} className="text-[#635BFF]" />
                <span className="text-xs text-secondary-foreground/80 font-medium">Stripe</span>
              </div>
              <div className="bg-secondary-foreground/10 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <Building2 size={14} className="text-primary" />
                <span className="text-xs text-secondary-foreground/80 font-medium">SPEI</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg text-secondary-foreground mb-4">
              {language === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="footer-link text-secondary-foreground/70 hover:text-primary">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sectors */}
          <div>
            <h4 className="font-display font-bold text-lg text-secondary-foreground mb-4">
              {language === 'es' ? 'Sectores' : 'Sectors'}
            </h4>
            <ul className="space-y-3">
              {sectors.map((sector) => (
                <li key={sector.name}>
                  <Link to={sector.href} className="footer-link text-secondary-foreground/70 hover:text-primary">
                    {language === 'es' ? sector.name : (sector.nameEn || sector.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-display font-bold text-lg text-secondary-foreground mb-4">
              {language === 'es' ? 'Ayuda' : 'Help'}
            </h4>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="footer-link text-secondary-foreground/70 hover:text-primary">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg text-secondary-foreground mb-4">
              {language === 'es' ? '¿Necesitas Ayuda?' : 'Need Help?'}
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary-foreground/60 mb-2">{language === 'es' ? 'México' : 'Mexico'}</p>
                <a href="tel:662-168-0047" className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors">
                  <Phone size={16} />
                  662-168-0047
                </a>
                <a href="mailto:ventas@mercadoindustrial.mx" className="flex items-center gap-2 text-secondary-foreground/70 hover:text-primary transition-colors mt-1">
                  <Mail size={16} />
                  ventas@mercadoindustrial.mx
                </a>
              </div>
              <div>
                <p className="text-sm text-secondary-foreground/60 mb-2">{language === 'es' ? 'Estados Unidos' : 'United States'}</p>
                <a href="tel:956-321-8438" className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors">
                  <Phone size={16} />
                  956-321-8438
                </a>
                <a href="mailto:industrialmarketllc@gmail.com" className="flex items-center gap-2 text-secondary-foreground/70 hover:text-primary transition-colors mt-1">
                  <Mail size={16} />
                  industrialmarketllc@gmail.com
                </a>
              </div>
              <a
                href="https://wa.me/526621680047"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 btn-gold mt-4"
              >
                {language === 'es' ? 'Ir a WhatsApp' : 'Go to WhatsApp'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-secondary-foreground/60">
            <p>© {new Date().getFullYear()} Mercado Industrial. {t('footer.rights')}.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacidad" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
              <Link to="/terminos" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
