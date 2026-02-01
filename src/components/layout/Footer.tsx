import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';

const locations = [
  {
    city: 'Hermosillo, Sonora, México',
    address: 'Héctor Acedo Valenzuela N° 2, Sector Industrial Presa, 83293',
    hours: 'Lun-Vie: 8am - 6pm | Sáb: 8am - 1pm',
    mapUrl: 'https://www.google.com/maps/place/Mercado+Industrial+Hermosillo/@29.0572594,-110.9295005,17z/data=!3m1!4b1!4m6!3m5!1s0x86ce85b40f79ef99:0xee634bca8042b1c4!8m2!3d29.0572547!4d-110.9269256!16s%2Fg%2F1tz965kx',
  },
  {
    city: 'Mexicali, Baja California, México',
    address: 'Carretera San Felipe Km 13, 21700',
    hours: 'Lun-Vie: 8am - 6pm | Sáb: 8am - 1pm',
    mapUrl: 'https://www.google.com/maps/place/Mercado+Industrial+Mexicali/@32.4908859,-115.3954778,17z/data=!3m1!4b1!4m6!3m5!1s0x80d79d9164f19ec5:0x21036e9e58c04bc2!8m2!3d32.4908814!4d-115.3929029!16s%2Fg%2F11q3_fsvvf',
  },
  {
    city: 'Santa Catarina, Nuevo León, México',
    address: 'Blvd. Luis Donaldo Colosio, Parque Industrial, C.P. 66384',
    hours: 'Lun-Vie: 8am - 6pm | Sáb: 8am - 1pm',
    mapUrl: 'https://www.google.com/maps/place/Mercado+Industrial+Santa+Catarina/@25.7212736,-100.5028245,17z/data=!3m1!4b1!4m6!3m5!1s0x866299dbe0ce3615:0xf17d2e79426c8a1d!8m2!3d25.7212688!4d-100.4979536!16s%2Fg%2F11vjhrw6f8',
  },
  {
    city: 'Tijuana, Baja California, México',
    address: 'Calle And. Vecinal 17521, Río Tijuana 3a. Etapa, 22124',
    hours: 'Lun-Vie: 8am - 6pm | Sáb: 8am - 1pm',
    mapUrl: 'https://www.google.com/maps/place/Mercado+Industrial+%7C+Maquinaria+%7C+Equipos+Mineros/@32.4415176,-116.9032863,17z/data=!3m1!4b1!4m6!3m5!1s0x80d9393730e1ad99:0x7be3e8a5fbf32297!8m2!3d32.4415131!4d-116.9007114!16s%2Fg%2F11rs0ng1lx',
  },
  {
    city: 'Nogales, Arizona, USA',
    address: '1481 N Industrial Park Dr, Nogales, AZ 85621',
    hours: 'Lun-Vie: 8am - 5pm',
    mapUrl: 'https://www.google.com/maps/place/1481+N+Industrial+Park+Dr+%234,+Nogales,+AZ+85621,+EE.+UU./@31.3598945,-110.9523053,17z/data=!3m1!4b1!4m6!3m5!1s0x86d6adab30a3ec1d:0x4596a00e3c7e8ee4!8m2!3d31.3598945!4d-110.9497304!16s%2Fg%2F11qz9hx6rw',
  },
];

const quickLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Catálogo', href: '/catalogo' },
  { name: 'Marcas', href: '/marcas' },
  { name: 'Blog', href: '/blog' },
  { name: 'Quiénes Somos', href: '/nosotros' },
  { name: 'Vende con Nosotros', href: '/como-vender' },
];

const helpLinks = [
  { name: 'Preguntas frecuentes', href: '/faq' },
  { name: 'Cómo vender con nosotros', href: '/como-vender' },
  { name: 'Cómo comprar con nosotros', href: '/como-comprar' },
  { name: 'Subastas y ofertas', href: '/subastas-y-ofertas' },
  { name: 'Políticas de pago', href: '/politicas-de-pago' },
];

const sectors = [
  { name: 'Industrial', href: '/catalogo?sector=industrial' },
  { name: 'Minería', href: '/catalogo?sector=mineria' },
  { name: 'Construcción', href: '/catalogo?sector=construccion' },
  { name: 'Alimenticio', href: '/catalogo?sector=alimenticio' },
  { name: 'Eléctrico', href: '/catalogo?sector=electrico' },
  { name: 'Agroindustria', href: '/catalogo?sector=agroindustria' },
];

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="bg-secondary text-secondary-foreground">
      {/* Locations Section */}
      <div className="border-b border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-12">
          <h3 className="section-title text-secondary-foreground mb-8">Nuestras Ubicaciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {locations.map((location) => (
              <a
                key={location.city}
                href={location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-secondary-foreground/5 hover:bg-secondary-foreground/10 rounded-xl p-5 transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="text-primary shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-secondary-foreground group-hover:text-primary transition-colors">
                      {location.city}
                    </h4>
                    <p className="text-sm text-secondary-foreground/70 mt-1">{location.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-foreground/60">
                  <Clock size={14} />
                  <span>{location.hours}</span>
                </div>
                <div className="flex items-center gap-1 text-primary text-sm mt-3 group-hover:underline">
                  Ver en mapa
                  <ExternalLink size={14} />
                </div>
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
              E-Business con atención personalizada. Tu marketplace de confianza para maquinaria y equipo industrial.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.paypal.com/paypalme/mercadoindustrial"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary-foreground/10 hover:bg-secondary-foreground/20 rounded-lg px-4 py-2 transition-colors"
              >
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg text-secondary-foreground mb-4">Enlaces Rápidos</h4>
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
            <h4 className="font-display font-bold text-lg text-secondary-foreground mb-4">Sectores</h4>
            <ul className="space-y-3">
              {sectors.map((sector) => (
                <li key={sector.name}>
                  <Link to={sector.href} className="footer-link text-secondary-foreground/70 hover:text-primary">
                    {sector.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-display font-bold text-lg text-secondary-foreground mb-4">Ayuda</h4>
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
            <h4 className="font-display font-bold text-lg text-secondary-foreground mb-4">¿Necesitas Ayuda?</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary-foreground/60 mb-2">México</p>
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
                <p className="text-sm text-secondary-foreground/60 mb-2">Estados Unidos</p>
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
                Ir a WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-secondary-foreground/60">
            <p>© {new Date().getFullYear()} Mercado Industrial. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link>
              <Link to="/terminos" className="hover:text-primary transition-colors">Términos y Condiciones</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
