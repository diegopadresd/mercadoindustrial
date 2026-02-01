import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import WelcomeAnnouncementOverlay from "./components/WelcomeAnnouncementOverlay";
import Catalogo from "./pages/Catalogo";
import ProductoDetalle from "./pages/ProductoDetalle";
import Marcas from "./pages/Marcas";
import Blog from "./pages/Blog";
import Nosotros from "./pages/Nosotros";
import Vende from "./pages/Vende";
import Recientes from "./pages/Recientes";
import Carrito from "./pages/Carrito";
import Cotizador from "./pages/Cotizador";
import Auth from "./pages/Auth";
import Perfil from "./pages/Perfil";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              <Route path="/productos/:id" element={<ProductoDetalle />} />
              <Route path="/marcas" element={<Marcas />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<Blog />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/vende" element={<Vende />} />
              <Route path="/recientes" element={<Recientes />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/cotizador" element={<Cotizador />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
