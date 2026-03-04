
## Diagnóstico

El problema es puntual: `handleQuoteRequest` en `ProductoDetalle.tsx` (línea ~410) hace `addToCart(...)` + `navigate('/carrito')` — es decir, se comporta igual que "Agregar al carrito". **No se borró el sistema de ofertas** — `MakeOfferModal` sigue intacto en el archivo (líneas 831, 862, 895).

El usuario confundió "desapareció el botón de ofertas" con el hecho de que el botón "Solicitar cotización" redirige al carrito en vez del cotizador.

## El único cambio necesario

**`src/pages/ProductoDetalle.tsx`** — reemplazar el cuerpo de `handleQuoteRequest` para que navegue a `/cotizador?productoId={id}` en lugar de agregar al carrito:

```typescript
// ANTES (incorrecto):
const handleQuoteRequest = async () => {
  if (!productData) return;
  await addToCart({ ... });
  navigate('/carrito');
};

// DESPUÉS (correcto):
const handleQuoteRequest = () => {
  if (!productData) return;
  navigate(`/cotizador?productoId=${productData.id}`);
};
```

Esto aplica a los 3 lugares donde aparece el botón "Solicitar cotización" (productos sin precio, con `contact_for_quote`, y el caso genérico) — todos llaman al mismo `handleQuoteRequest`, así que con cambiar la función una sola vez queda resuelto.

**El sistema de ofertas (`MakeOfferModal`) no fue borrado y no necesita cambios.**

## Archivos a cambiar
```
src/pages/ProductoDetalle.tsx  — solo la función handleQuoteRequest (~3 líneas)
```
