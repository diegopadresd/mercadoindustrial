import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary/10 to-primary/10">
      <div className="text-center px-4">
        <div className="text-8xl md:text-9xl font-display font-bold text-primary/20 mb-4">
          404
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Página no encontrada
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="btn-gold">
            <Link to="/">
              <Home size={18} className="mr-2" />
              Ir al inicio
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/catalogo-mi">
              <Search size={18} className="mr-2" />
              Explorar catálogo
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
