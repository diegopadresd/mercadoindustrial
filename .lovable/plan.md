
## Status audit: which items are done vs. still pending

### 1. Slugs de mercadoindustrial.com.mx en /catalogo-mi
**PARCIALMENTE resuelto.**
`Catalogo.tsx` tiene un `categorySlugMap` hardcoded con ~16 categorías y un `sectorSlugMap` con 6 sectores. Pero este mapa **no cubre slugs de marca** ni todos los slugs de categoría que existen en el sitio actual. Tampoco hay cobertura para los slugs de las páginas `/marca/:slug` y `/etiqueta/:slug` — si alguien llega con un slug que no coincide exactamente con la base de datos (acentos, capitalización, etc.), no verá productos.

Lo que falta concretamente:
- Un `brandSlugMap` similar para marcas (actualmente `MarcaDetalle.tsx` usa `slugify()` para hacer el match, lo que sí funciona bien automáticamente via `useBrands()`)
- Verificar que `EtiquetaDetalle.tsx` también usa `useCategories()` para el match (sí lo hace — está correcto)
- El `categorySlugMap` en Catalogo.tsx solo tiene 16 entradas — si mercadoindustrial.com.mx tiene más slugs de categoría en las URLs, no redirigirán correctamente

**Pendiente menor**: ampliar el `categorySlugMap` con todos los slugs que usan en producción.

---

### 2. Páginas de listado por marca `/marca/:slug`
**RESUELTO.** ✅
- `MarcaDetalle.tsx` existe y está creado
- La ruta `/marca/:slug` está registrada en `App.tsx` (línea 113)
- Usa `useBrands()` + `slugify()` para resolver el nombre canónico
- Tiene paginación, ordenamiento, y grid de productos

---

### 3. Páginas de listado por etiqueta `/etiqueta/:slug`
**RESUELTO.** ✅
- `EtiquetaDetalle.tsx` existe y está creado
- La ruta `/etiqueta/:slug` está registrada en `App.tsx` (línea 114)
- Usa `useCategories()` + `slugify()` para resolver el nombre canónico

---

### 4. Botón Cotizar como popup en listados
**RESUELTO.** ✅
- `ProductCard.tsx` tiene `Dialog` con estado `cotizarOpen`
- El popup muestra el producto, botón "Agregar al carrito para cotizar" y "Cotizador de fletes →"
- No navega en el click del botón, abre el Dialog

---

### 5. Categorías en ProductoDetalle → `/catalogo-mi/slug-categoria`
**NO RESUELTO tal como se pidió.** ⚠️
El usuario pidió que las categorías en la ficha de producto lleven a **`/catalogo-mi/slug-categoria`**. En el código actual (línea 742):
```tsx
<Link key={cat} to={`/etiqueta/${slugify(cat)}`}>
```
Están apuntando a **`/etiqueta/slug`** en lugar de **`/catalogo-mi?categoria=...`** o el patrón que el usuario especificó (`urlbase/catalogo-mi/slug-categoria`). 

El usuario dijo: "En la vista de producto individual, falta que **al presionarse la categoría**, este envíe a una dirección **urlbase/catalogo-mi/slug-categoria**". Actualmente van a `/etiqueta/` en lugar de `/catalogo-mi/`. Esto es incorrecto vs. lo especificado.

**Fix necesario**: cambiar el destino de categorías (en la ficha de producto) de `/etiqueta/${slugify(cat)}` a `/catalogo-mi?categoria=${encodeURIComponent(cat)}` o crear una ruta `/catalogo-mi/:slug` que cargue el catálogo pre-filtrado.

---

### 6. Etiquetas (tags) en ProductoDetalle → `/etiqueta/:slug`
**RESUELTO.** ✅
Línea 602: `<Link key={tag} to={`/etiqueta/${slugify(tag)}`}>` — correcto.

---

### 7. Marca en ProductoDetalle → `/marca/:slug`
**RESUELTO.** ✅
Línea 764: `<Link to={`/marca/${slugify(productData.brand)}`}` — correcto.

---

### 8. Filtros con cajas de búsqueda de marca y categoría
**RESUELTO.** ✅
`Catalogo.tsx` líneas 104-108 tienen `brandSearch` + `categorySearch` states. Las líneas 155-178 y 188-213 muestran los `<Input>` de búsqueda antes de las listas de checkboxes, con filtrado client-side.

---

### 9. Carrito respeta stock y sin refresh al cambiar cantidad
**RESUELTO.** ✅
- `CartContext.tsx` carga `stock` del producto (línea 83, 110)
- `updateQuantity` usa optimistic update (línea 203) sin `loadCart()` tras el update
- `Carrito.tsx` línea 145 deshabilita el botón `+` cuando `item.quantity >= item.stock`
- Muestra badge "Máx" (línea 152)

---

### 10. Ajustes responsivos en ProductoDetalle
**PARCIALMENTE resuelto.** ⚠️
El plan originalmente especificó: cambiar `gap-12` a `gap-6 lg:gap-12` y añadir `min-w-0` / `overflow-hidden`.

Revisando el código actual (línea 461): `className="grid lg:grid-cols-2 gap-6 lg:gap-12"` — el gap ya fue ajustado ✅.

Sin embargo el usuario menciona que **"sigue siendo muy ancho"** en la vista móvil. Dado que el viewport actual es 440px (móvil), probablemente hay más detalles por ajustar que no se resolvieron completamente: el `motion.div` de info del producto no tiene `min-w-0`, las imágenes del thumbnail gallery pueden desbordar, y el bloque de acciones puede tener problemas de wrapping.

---

## Resumen de pendientes

| # | Item | Estado |
|---|------|--------|
| 1 | Slugs de mercadoindustrial.com.mx | ⚠️ Parcial — falta ampliar categorySlugMap |
| 2 | `/marca/:slug` | ✅ Completo |
| 3 | `/etiqueta/:slug` | ✅ Completo |
| 4 | Cotizar como popup | ✅ Completo |
| 5 | Categorías → `/catalogo-mi/` | ❌ Incorrecto — van a `/etiqueta/` en vez de al catálogo |
| 6 | Etiquetas → `/etiqueta/:slug` | ✅ Completo |
| 7 | Marca → `/marca/:slug` | ✅ Completo |
| 8 | Búsqueda en filtros | ✅ Completo |
| 9 | Stock en carrito / sin refresh | ✅ Completo |
| 10 | Responsivo ProductoDetalle | ⚠️ Parcial — gap ajustado, pero puede necesitar más revisión |

---

## Plan de correcciones

### Fix 1: Categorías en ProductoDetalle → catálogo filtrado (no /etiqueta/)
En `ProductoDetalle.tsx` línea 742, cambiar:
```tsx
to={`/etiqueta/${slugify(cat)}`}
```
por:
```tsx
to={`/catalogo-mi?categoria=${encodeURIComponent(cat)}`}
```
Esto envía al catálogo con ese filtro pre-seleccionado, que es lo que el usuario especificó como `urlbase/catalogo-mi/slug-categoria`.

### Fix 2: Responsivo en ProductoDetalle
Revisar el bloque principal (línea 461+) en mobile para:
- Añadir `min-w-0` a la columna de info del producto
- Asegurar que la galería de thumbnails no desborde horizontalmente (`overflow-x-auto` o `flex-wrap`)
- Revisar el bloque de botones de acción en mobile para que el layout sea correcto en 440px
- El bloque de precio + botones puede necesitar `flex-col` en móvil

### Fix 3: Slugs de mercadoindustrial.com.mx en categorySlugMap
Ampliar el `categorySlugMap` en `Catalogo.tsx` con los slugs adicionales que existen en el sitio de producción (ej. `equipos-electricos`, `bombas`, etc.) para que las URLs antiguas/entrantes redirijan al filtro correcto.

**Files to change:**
```
src/pages/ProductoDetalle.tsx   → Fix 1: categorías → /catalogo-mi?categoria=
                                → Fix 2: responsive tweaks (min-w-0, thumbnail overflow)
src/pages/Catalogo.tsx          → Fix 3: ampliar categorySlugMap con más slugs
```
