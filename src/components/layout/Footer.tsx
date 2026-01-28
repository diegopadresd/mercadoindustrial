import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';

const locations = [
  {
    city: 'Hermosillo, Sonora, México',
    address: 'Héctor Acedo Valenzuela N° 2, Sector Industrial Presa, 83293',
    hours: 'Lun-Vie: 8am - 6pm | Sáb: 8am - 1pm',
    mapUrl: 'https://maps.app.goo.gl/Ht7eYihAnxDLbTnJ6',
  },
  {
    city: 'Mexicali, Baja California, México',
    address: 'Carretera San Felipe Km 13, 21700',
    hours: 'Lun-Vie: 8am - 6pm | Sáb: 8am - 1pm',
    mapUrl: 'https://maps.app.goo.gl/Eu9W5dMo7NqDnbi58',
  },
  {
    city: 'Santa Catarina, Nuevo León, México',
    address: 'Blvd. Luis Donaldo Colosio, Parque Industrial, C.P. 66384',
    hours: 'Lun-Vie: 8am - 6pm | Sáb: 8am - 1pm',
    mapUrl: 'https://maps.app.goo.gl/3ACKGVUZy3dcbxRX7',
  },
  {
    city: 'Tijuana, Baja California, México',
    address: 'Calle And. Vecinal 17521, Río Tijuana 3a. Etapa, 22124',
    hours: 'Lun-Vie: 8am - 6pm | Sáb: 8am - 1pm',
    mapUrl: 'https://maps.app.goo.gl/gntE4DAErYDLKayq8',
  },
  {
    city: 'Nogales, Arizona, USA',
    address: '1481 N Industrial Park Dr, Nogales, AZ 85621',
    hours: 'Lun-Vie: 8am - 5pm',
    mapUrl: 'https://maps.app.goo.gl/LuWMyXKqjhjeoUe6A',
  },
];

const quickLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Catálogo', href: '/catalogo' },
  { name: 'Marcas', href: '/marcas' },
  { name: 'Blog', href: '/blog' },
  { name: 'Quiénes Somos', href: '/nosotros' },
  { name: 'Vende con Nosotros', href: '/vende' },
];

const sectors = [
  { name: 'Industrial', href: '/catalogo?sector=industrial' },
  { name: 'Minería', href: '/catalogo?sector=mineria' },
  { name: 'Construcción', href: '/catalogo?sector=construccion' },
  { name: 'Alimenticio', href: '/catalogo?sector=alimenticio' },
  { name: 'Eléctrico', href: '/catalogo?sector=electrico' },
  { name: 'Agroindustria', href: '/catalogo?sector=agroindustria' },
];

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
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
};
