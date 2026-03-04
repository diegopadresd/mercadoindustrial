
## Hallazgos de la verificación

### ✅ Lo que funciona correctamente

1. **FloatingCart en móvil** — Posicionado en `bottom-20 sm:bottom-6`, correctamente evita la barra de navegación del móvil. Implementado correctamente en `FloatingCart.tsx`.

2. **Botones de acción en detalle de producto** — En móvil se ven apilados verticalmente con `flex-col sm:flex-row`. Los botones "Agregar al carrito" y "Solicitar cotización" se muestran separados y en columna. `allow_offers` guard está en su lugar.

3. **Miniaturas de imágenes** — Implementado con `overflow-x-auto` para scroll horizontal en móvil, funcionando correctamente.

4. **Etiquetas/Categorías visibles** — Se muestran correctamente en el detalle del producto.

5. **Mapa interactivo de sucursales** — Existe en `ContactSection.tsx` con selector de 5 sucursales (Hermosillo, Mexicali, Santa Catarina, Tijuana, Nogales) e iframe dinámico. Verificado por el extractor de página.

### ⚠️ Problemas encontrados que requieren corrección

1. **El mapa de sucursales no está accesible desde el navbar** — La sección está en la homepage pero no en `/contacto`. Los usuarios que vayan a la página de Contacto no ven el mapa de sucursales. Hay que agregar el selector de sucursales + mapa también en `src/pages/Contacto.tsx`.

2. **`ContactSection.tsx` en homepage: el mapa y selector de sucursales NO es visible en móvil en el scroll** — Al hacer scroll en la homepage en 390px, la sección de contacto muestra el formulario pero el mapa y los botones de sucursal quedaron fuera del viewport visible durante la prueba. Necesita confirmar que los branch buttons (grilla de 5) no se desborden en `grid-cols-5` en pantallas pequeñas — actualmente usa `lg:grid-cols-5 gap-2` que en móvil collapsa a 1 columna, pero en tablet puede colapsar mal.

3. **El número de teléfono de Santa Catarina parece un placeholder** — `81-2345-6789` parece inventado, no un número real de Mercado Industrial.

## Plan de correcciones

### Archivo 1: `src/pages/Contacto.tsx`
- Importar y renderizar el componente `ContactSection` (con el mapa) dentro de la página de Contacto, debajo del formulario actual — o reemplazar la sección de info de sucursales actual con el componente compartido.

### Archivo 2: `src/components/home/ContactSection.tsx`
- Cambiar el grid de sucursales de `grid-cols-5` a `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` para que en móvil no sean 5 botones apilados verticalmente sino 2 columnas.
- Corregir el número placeholder de Santa Catarina si se tiene el número real (o marcar como "Próximamente").

## Archivos a cambiar
```
src/pages/Contacto.tsx          — agregar mapa de sucursales
src/components/home/ContactSection.tsx  — fix grid responsive en móvil
```

Cambio pequeño y enfocado. Sin nuevas dependencias.
