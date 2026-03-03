import { lazy, Suspense } from "react";
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

// Eagerly load Index for fastest FCP on homepage
import Index from "./pages/Index";

// Lazy load all other pages
const Catalogo = lazy(() => import("./pages/Catalogo"));
const ProductoDetalle = lazy(() => import("./pages/ProductoDetalle"));
const Marcas = lazy(() => import("./pages/Marcas"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetalle = lazy(() => import("./pages/BlogDetalle"));
const Nosotros = lazy(() => import("./pages/Nosotros"));
const Recientes = lazy(() => import("./pages/Recientes"));
const Carrito = lazy(() => import("./pages/Carrito"));
const Cotizador = lazy(() => import("./pages/Cotizador"));
const Auth = lazy(() => import("./pages/Auth"));
const Perfil = lazy(() => import("./pages/Perfil"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FAQ = lazy(() => import("./pages/FAQ"));
const ComoVender = lazy(() => import("./pages/ComoVender"));
const ComoComprar = lazy(() => import("./pages/ComoComprar"));
const SubastasYOfertas = lazy(() => import("./pages/SubastasYOfertas"));
const Subastas = lazy(() => import("./pages/Subastas"));
const PoliticasDePago = lazy(() => import("./pages/PoliticasDePago"));
const Privacidad = lazy(() => import("./pages/Privacidad"));
const Terminos = lazy(() => import("./pages/Terminos"));
const Contacto = lazy(() => import("./pages/Contacto"));
const Soporte = lazy(() => import("./pages/Soporte"));
const CheckoutContraoferta = lazy(() => import("./pages/CheckoutContraoferta"));
const CheckoutCotizacion = lazy(() => import("./pages/CheckoutCotizacion"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/checkout/CheckoutSuccess"));
const CheckoutFailure = lazy(() => import("./pages/checkout/CheckoutFailure"));
const CheckoutPending = lazy(() => import("./pages/checkout/CheckoutPending"));
const VentaExterna = lazy(() => import("./pages/VentaExterna"));
// Mi Cuenta pages
const MiCuenta = lazy(() => import("./pages/MiCuenta"));
const MisPublicaciones = lazy(() => import("./pages/mi-cuenta/MisPublicaciones"));
const MisCompras = lazy(() => import("./pages/mi-cuenta/MisCompras"));
const MisOfertas = lazy(() => import("./pages/mi-cuenta/MisOfertas"));
const Chats = lazy(() => import("./pages/mi-cuenta/Chats"));
const ActivarVendedor = lazy(() => import("./pages/mi-cuenta/ActivarVendedor"));
const PublicarProducto = lazy(() => import("./pages/mi-cuenta/PublicarProducto"));

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
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
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
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LocaleProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
