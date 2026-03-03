import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import WelcomeAnnouncementOverlay from "./components/WelcomeAnnouncementOverlay";

import Index from "./pages/Index";
import Catalogo from "./pages/Catalogo";
import ProductoDetalle from "./pages/ProductoDetalle";
import Marcas from "./pages/Marcas";
import Blog from "./pages/Blog";
import BlogDetalle from "./pages/BlogDetalle";
import Nosotros from "./pages/Nosotros";
import Recientes from "./pages/Recientes";
import Carrito from "./pages/Carrito";
import Cotizador from "./pages/Cotizador";
import Auth from "./pages/Auth";
import Perfil from "./pages/Perfil";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import ComoVender from "./pages/ComoVender";
import ComoComprar from "./pages/ComoComprar";
import SubastasYOfertas from "./pages/SubastasYOfertas";
import Subastas from "./pages/Subastas";
import PoliticasDePago from "./pages/PoliticasDePago";
import Privacidad from "./pages/Privacidad";
import Terminos from "./pages/Terminos";
import Contacto from "./pages/Contacto";
import Soporte from "./pages/Soporte";
import CheckoutContraoferta from "./pages/CheckoutContraoferta";
import CheckoutCotizacion from "./pages/CheckoutCotizacion";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/checkout/CheckoutSuccess";
import CheckoutFailure from "./pages/checkout/CheckoutFailure";
import CheckoutPending from "./pages/checkout/CheckoutPending";
import VentaExterna from "./pages/VentaExterna";
import MiCuenta from "./pages/MiCuenta";
import MisPublicaciones from "./pages/mi-cuenta/MisPublicaciones";
import MisCompras from "./pages/mi-cuenta/MisCompras";
import MisOfertas from "./pages/mi-cuenta/MisOfertas";
import Chats from "./pages/mi-cuenta/Chats";
import ActivarVendedor from "./pages/mi-cuenta/ActivarVendedor";
import PublicarProducto from "./pages/mi-cuenta/PublicarProducto";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <LocaleProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <WelcomeAnnouncementOverlay />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/venta-externa" element={<VentaExterna />} />
                <Route path="/productos/:id" element={<ProductoDetalle />} />
                <Route path="/marcas" element={<Marcas />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogDetalle />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/recientes" element={<Recientes />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/cotizador" element={<Cotizador />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/perfil" element={<Perfil />} />
                {/* Mi Cuenta Routes */}
                <Route path="/mi-cuenta" element={<MiCuenta />} />
                <Route path="/mi-cuenta/mis-publicaciones" element={<MisPublicaciones />} />
                <Route path="/mi-cuenta/mis-compras" element={<MisCompras />} />
                <Route path="/mi-cuenta/mis-ofertas" element={<MisOfertas />} />
                <Route path="/mi-cuenta/chats" element={<Chats />} />
                <Route path="/mi-cuenta/vender" element={<ActivarVendedor />} />
                <Route path="/mi-cuenta/publicar" element={<PublicarProducto />} />
                {/* Checkout Routes */}
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/checkout/failure" element={<CheckoutFailure />} />
                <Route path="/checkout/pending" element={<CheckoutPending />} />
                <Route path="/checkout/contraoferta/:offerId" element={<CheckoutContraoferta />} />
                <Route path="/checkout/cotizacion/:orderId" element={<CheckoutCotizacion />} />
                {/* Help & Info Pages */}
                <Route path="/faq" element={<FAQ />} />
                <Route path="/como-vender" element={<ComoVender />} />
                <Route path="/como-comprar" element={<ComoComprar />} />
                <Route path="/subastas-y-ofertas" element={<SubastasYOfertas />} />
                <Route path="/subastas" element={<Subastas />} />
                <Route path="/politicas-de-pago" element={<PoliticasDePago />} />
                <Route path="/privacidad" element={<Privacidad />} />
                <Route path="/terminos" element={<Terminos />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/soporte" element={<Soporte />} />
                {/* Admin Panel */}
                <Route path="/admin/*" element={<AdminDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LocaleProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
