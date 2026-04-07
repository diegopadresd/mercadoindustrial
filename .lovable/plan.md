

## Consolidate 3 Admin Pages into a Single "Herramientas" Section

### Problem
"Importar Slugs", "Importar Clientes", and "Auditoría de Enlaces" are 3 separate sidebar entries that clutter the admin navigation. They're all admin-only utility tools that are rarely used.

### Solution
Create a single **"Herramientas"** (Tools) sidebar entry at `/admin/herramientas` that contains all 3 utilities as tabs within one page.

### Changes

**1. New file: `src/pages/admin/AdminHerramientas.tsx`**
- A single page with 3 tabs using shadcn `Tabs` component:
  - **Importar Clientes** — embeds existing `AdminImportClients` content
  - **Importar Slugs** — embeds existing `AdminImportSlugs` content  
  - **Auditoría de Enlaces** — embeds existing `AdminAuditoriaEnlaces` content
- Each tab renders the existing component directly (no rewrite needed)

**2. Modify: `src/pages/admin/Dashboard.tsx`**
- Remove the 3 individual sidebar entries (Importar Clientes, Importar Slugs, Auditoría Enlaces)
- Add one entry: `{ icon: Wrench, label: 'Herramientas', path: '/admin/herramientas', description: 'Importación y auditoría', adminOnly: true }`
- Remove the 3 individual `<Route>` entries
- Add one route: `<Route path="herramientas" element={<AdminHerramientas />} />`

### Result
Sidebar goes from 3 entries → 1 entry. All functionality preserved, just grouped under tabs.

