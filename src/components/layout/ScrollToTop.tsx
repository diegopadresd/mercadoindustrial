import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fuerza que cada navegación de ruta abra la página desde arriba.
 * (React Router por defecto conserva la posición del scroll.)
 */
export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return null;
}
