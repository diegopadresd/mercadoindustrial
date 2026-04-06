import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Store, CreditCard, Building2 } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const locations = [
  { city: 'Hermosillo', mapUrl: 'https://www.google.com/maps/place/Mercado+Industrial+Hermosillo/@29.0572594,-110.9295005,17z' },
  { city: 'Mexicali', mapUrl: 'https://www.google.com/maps/place/Mexicali,+Baja+California' },
  { city: 'Santa Catarina', mapUrl: 'https://www.google.com/maps/place/Mercado+Industrial+Santa+Catarina/@25.7212736,-100.5028245,17z' },
  { city: 'Tijuana', mapUrl: 'https://www.google.com/maps/place/Tijuana,+Baja+California' },
  { city: 'Nogales, AZ', mapUrl: 'https://www.google.com/maps/place/Nogales,+AZ' },
];

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { language, t } = useLocale();

  const companyLinks = language === 'es'
    ? [
        { name: 'Inicio', href: '/' },
        { name: 'Quiénes Somos', href: '/nosotros' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contacto', href: '/contacto' },
      ]
    : [
        { name: 'Home', href: '/' },
        { name: 'About Us', href: '/nosotros' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contact', href: '/contacto' },
      ];

  const productLinks = language === 'es'
    ? [
        { name: 'Catálogo', href: '/catalogo-mi' },
        { name: 'Marcas', href: '/marcas' },
        { name: 'Subastas y Ofertas', href: '/subastas-y-ofertas' },
        { name: 'Vende con Nosotros', href: '/como-vender' },
      ]
    : [
        { name: 'Catalog', href: '/catalogo-mi' },
        { name: 'Brands', href: '/marcas' },
        { name: 'Auctions & Offers', href: '/subastas-y-ofertas' },
        { name: 'Sell with Us', href: '/como-vender' },
      ];

  const supportLinks = language === 'es'
    ? [
        { name: 'Preguntas frecuentes', href: '/faq' },
        { name: 'Cómo comprar', href: '/como-comprar' },
        { name: 'Cómo vender', href: '/como-vender' },
        { name: 'Soporte', href: '/soporte' },
      ]
    : [
        { name: 'FAQ', href: '/faq' },
        { name: 'How to Buy', href: '/como-comprar' },
        { name: 'How to Sell', href: '/como-vender' },
        { name: 'Support', href: '/soporte' },
      ];

  const legalLinks = language === 'es'
    ? [
        { name: 'Privacidad', href: '/privacidad' },
        { name: 'Términos y Condiciones', href: '/terminos' },
        { name: 'Políticas de Pago', href: '/politicas-de-pago' },
      ]
    : [
        { name: 'Privacy', href: '/privacidad' },
        { name: 'Terms & Conditions', href: '/terminos' },
        { name: 'Payment Policies', href: '/politicas-de-pago' },
      ];

  const sections = [
    { title: language === 'es' ? 'Empresa' : 'Company', links: companyLinks },
    { title: language === 'es' ? 'Productos' : 'Products', links: productLinks },
    { title: language === 'es' ? 'Soporte' : 'Support', links: supportLinks },
    { title: 'Legal', links: legalLinks },
  ];

  return (
    <footer ref={ref} className="bg-secondary text-secondary-foreground">
      {/* Locations */}
      <div className="border-b border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-8">
          <h3 className="font-display font-bold text-secondary-foreground mb-4">
            {language === 'es' ? 'Nuestras ubicaciones' : 'Our Locations'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {locations.map(loc => (
              <a key={loc.city} href={loc.mapUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-secondary-foreground/80 hover:text-primary transition-colors">
                <MapPin className="text-primary shrink-0" size={16} />
                <span>{loc.city}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand + Payment */}
          <div className="col-span-2">
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
              <a href="https://www.paypal.com/paypalme/mercadoindustrial" target="_blank" rel="noopener noreferrer"
                className="bg-secondary-foreground/10 hover:bg-secondary-foreground/20 rounded-lg px-3 py-2 transition-colors">
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

          {/* 4 Link Sections */}
          {sections.map(section => (
            <div key={section.title}>
              <h4 className="font-display font-bold text-lg text-secondary-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="footer-link text-secondary-foreground/70 hover:text-primary">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Row */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-secondary-foreground/60 mb-1">{language === 'es' ? 'México' : 'Mexico'}</p>
            <a href="tel:662-168-0047" className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors">
              <Phone size={16} /> 662-168-0047
            </a>
          </div>
          <div>
            <p className="text-sm text-secondary-foreground/60 mb-1">{language === 'es' ? 'Estados Unidos' : 'United States'}</p>
            <a href="tel:956-321-8438" className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors">
              <Phone size={16} /> 956-321-8438
            </a>
          </div>
          <div>
            <a href="mailto:ventas@mercadoindustrial.mx" className="flex items-center gap-2 text-secondary-foreground/70 hover:text-primary transition-colors">
              <Mail size={16} /> ventas@mercadoindustrial.mx
            </a>
          </div>
          <div>
            <a href="https://wa.me/526621680047" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 btn-gold">
              {language === 'es' ? 'Ir a WhatsApp' : 'Go to WhatsApp'}
            </a>
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
