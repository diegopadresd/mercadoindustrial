
## Auditoría de estado actual — todos los puntos verificados en código

### ✅ COMPLETAMENTE RESUELTO

**2. Páginas de listado por marca `/marca/:slug`**
`MarcaDetalle.tsx` existe, ruta registrada en App.tsx, usa `useBrands()` + `slugify()`.

**3. Páginas de listado por etiqueta `/etiqueta/:slug`**
`EtiquetaDetalle.tsx` existe, ruta registrada. Usa `useCategories()` + `slugify()`.

**4. Botón "Cotizar" como popup en listados**
`ProductCard.tsx` línea 61: `cotizarOpen` state + `Dialog` con "Agregar al carrito para cotizar" y "Cotizador de fletes →". ✅

**6. Etiquetas en ProductoDetalle → `/etiqueta/:slug`**
Línea 603: `<Link key={tag} to={`/etiqueta/${slugify(tag)}`}>` ✅

**7. Marca en ProductoDetalle → `/marca/:slug`**
Línea 765: `<Link to={`/marca/${slugify(productData.brand)}`}` ✅

**8. Cajas de búsqueda en filtros de catálogo**
Líneas 190-195 (categoría) y 222-228 (marca): `<Input placeholder="Buscar categoría...">` y `<Input placeholder="Buscar marca...">` con filtrado client-side. ✅

**9. Carrito respeta stock / sin refresh**
- `CartContext.tsx` línea 110: `stock: item.products?.stock ?? 1`
- `updateQuantity` línea 203: optimistic update sin `loadCart()` ✅
- `Carrito.tsx` línea 145: botón `+` deshabilitado cuando `item.quantity >= item.stock` ✅

**5. Categorías en ProductoDetalle → `/catalogo-mi?categoria=`**
Línea 743: `to={`/catalogo-mi?categoria=${encodeURIComponent(cat)}`}` ✅

### ✅ PARCIALMENTE RESUELTO (pero funcional)

**1. Slugs de mercadoindustrial.com.mx**
El `categorySlugMap` fue ampliado a ~40 entradas (líneas 30-80 en Catalogo.tsx). Cubre los slugs principales: `bombas-industriales`, `motores-electricos`, `equipos-electricos`, `maquinaria-pesada`, `cribas`, `compresores`, `tanques`, `valvulas`, `refacciones`, `bandas-transportadoras`, `plataformas-telescopicas`, etc.

Lo que falta: No existe un equivalente para marcas. Pero `MarcaDetalle.tsx` no usa un mapa hardcoded — usa `useBrands()` con `slugify()` dinámico, por lo que cualquier marca en la DB se resuelve automáticamente. No hay nada más que agregar aquí a menos que el usuario tenga slugs de marca específicos que NO coincidan con el nombre en la DB.

**10. Responsivo en ProductoDetalle**
- Línea 461: `className="grid lg:grid-cols-2 gap-6 lg:gap-12 min-w-0 overflow-hidden"` ✅
- Columna izquierda (línea 466): `className="min-w-0 overflow-hidden"` ✅
- Columna derecha (línea 733): `className="space-y-8 min-w-0"` ✅
- Thumbnails (línea 559): `className="flex gap-2 overflow-x-auto pb-2 w-full max-w-full"` ✅
- Thumbnails individuales (línea 564): `className="shrink-0 w-16 h-16 sm:w-20 sm:h-20"` ✅

El responsivo en el código se ve completo. Si el usuario sigue viendo desbordamiento, sería necesario ver un screenshot del preview para identificar qué elemento específico está causando el problema.

---

## Conclusión para el usuario

**TODOS los puntos del listado original están implementados.** Los únicos matices son:

1. **Slugs de producción** — el categorySlugMap tiene ~40 entradas. Si hay slugs específicos del sitio actual que no están en la lista, habría que agregarlos manualmente. Pero los más comunes sí están.

2. **Responsivo** — el código tiene todas las correcciones aplicadas (`min-w-0`, `overflow-hidden`, thumbnails con `overflow-x-auto`). Si aún se ve mal visualmente en el preview, sería un ajuste cosmético fino que requeriría ver un screenshot específico.

No hay código que necesite cambio. La respuesta apropiada es informar al usuario del estado actual y preguntar si al navegar en el preview algún punto específico se ve incorrecto.
