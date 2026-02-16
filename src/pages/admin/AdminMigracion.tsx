import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Play, Pause, CheckCircle, AlertCircle, Database, FileText, Image, Tag, MapPin, Loader2, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// ---- SQL COPY block parser ----
function parseCopyBlock(sql: string, tableName: string): { columns: string[]; rows: string[][] } | null {
  // Find COPY public.<tableName> (...) FROM stdin;
  const regex = new RegExp(
    `COPY\\s+public\\.${tableName}\\s*\\(([^)]+)\\)\\s+FROM\\s+stdin;`,
    'i'
  );
  const match = sql.match(regex);
  if (!match) return null;

  const columns = match[1].split(',').map(c => c.trim());
  const startIdx = sql.indexOf(match[0]) + match[0].length;
  
  // Find the end marker: a line that is just "\."
  const endMarker = '\n\\.\n';
  const endIdx = sql.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
    // Try with \r\n
    const endMarker2 = '\r\n\\.\r\n';
    const endIdx2 = sql.indexOf(endMarker2, startIdx);
    if (endIdx2 === -1) return { columns, rows: [] };
    const dataBlock = sql.substring(startIdx, endIdx2).trim();
    if (!dataBlock) return { columns, rows: [] };
    const rows = dataBlock.split(/\r?\n/).map(line => line.split('\t'));
    return { columns, rows };
  }
  
  const dataBlock = sql.substring(startIdx, endIdx).trim();
  if (!dataBlock) return { columns, rows: [] };
  const rows = dataBlock.split(/\r?\n/).map(line => line.split('\t'));
  return { columns, rows };
}

function parseVal(val: string): string | null {
  return val === '\\N' ? null : val;
}

interface ParsedData {
  brands: Map<string, string>; // id -> name
  categories: Map<string, string>; // id -> name
  files: Map<string, string>; // id -> file path
  ubicaciones: Map<string, string>; // id -> name
  productCategories: Map<string, string[]>; // product_id -> category_ids[]
  productFiles: Map<string, { fileId: string; order: number }[]>; // product_id -> file entries
  productUbicaciones: Map<string, string[]>; // product_id -> ubicacion_ids[]
  products: any[];
}

interface MigrationProduct {
  id: string;
  sku: string;
  title: string;
  description: string | null;
  brand: string;
  price: number | null;
  original_price: number | null;
  stock: number | null;
  is_active: boolean;
  is_new: boolean;
  categories: string[];
  images: string[];
  location: string | null;
  created_at: string | null;
  updated_at: string | null;
  contact_for_quote: boolean;
}

const AdminMigracion = () => {
  const [files, setFiles] = useState<{ part1?: File; part2?: File; part3?: File }>({});
  const [baseUrl, setBaseUrl] = useState('https://mercadoindustrial-files.s3.amazonaws.com/');
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [migrationProducts, setMigrationProducts] = useState<MigrationProduct[]>([]);
  const [inserting, setInserting] = useState(false);
  const [insertProgress, setInsertProgress] = useState(0);
  const [insertResults, setInsertResults] = useState<{ success: number; errors: number; skipped: number }>({ success: 0, errors: 0, skipped: 0 });
  const [previewProduct, setPreviewProduct] = useState<MigrationProduct | null>(null);
  const pauseRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleFileUpload = (part: 'part1' | 'part2' | 'part3', file: File) => {
    setFiles(prev => ({ ...prev, [part]: file }));
  };

  const parseFiles = useCallback(async () => {
    if (!files.part1 && !files.part2) {
      toast.error('Necesitas al menos Part 1 (schema + lookup tables) y Part 2 (productos)');
      return;
    }

    setParsing(true);
    toast.info('Leyendo archivos SQL... esto puede tardar unos segundos');

    try {
      const texts: string[] = [];
      for (const part of [files.part1, files.part2, files.part3]) {
        if (part) {
          texts.push(await part.text());
        }
      }
      const allSql = texts.join('\n');

      // Parse lookup tables
      const brandsData = parseCopyBlock(allSql, 'products_brand');
      const categoriesData = parseCopyBlock(allSql, 'products_category');
      const filesData = parseCopyBlock(allSql, 'files_file');
      const ubicacionesData = parseCopyBlock(allSql, 'products_ubicacion');
      const productCategoriesData = parseCopyBlock(allSql, 'products_product_categories');
      const productFilesData = parseCopyBlock(allSql, 'products_productandfile');
      const productUbicacionesData = parseCopyBlock(allSql, 'products_product_ubicaciones');
      const productsData = parseCopyBlock(allSql, 'products_product');

      // Build maps
      const brands = new Map<string, string>();
      if (brandsData) {
        const nameIdx = brandsData.columns.indexOf('name');
        const idIdx = brandsData.columns.indexOf('id');
        for (const row of brandsData.rows) {
          if (row[idIdx]) brands.set(row[idIdx], row[nameIdx] || 'Sin marca');
        }
      }

      const categories = new Map<string, string>();
      if (categoriesData) {
        const nameIdx = categoriesData.columns.indexOf('name');
        const idIdx = categoriesData.columns.indexOf('id');
        for (const row of categoriesData.rows) {
          if (row[idIdx]) categories.set(row[idIdx], row[nameIdx] || '');
        }
      }

      const fileMap = new Map<string, string>();
      if (filesData) {
        const fileIdx = filesData.columns.indexOf('file');
        const idIdx = filesData.columns.indexOf('id');
        for (const row of filesData.rows) {
          if (row[idIdx]) fileMap.set(row[idIdx], row[fileIdx] || '');
        }
      }

      const ubicaciones = new Map<string, string>();
      if (ubicacionesData) {
        const nameIdx = ubicacionesData.columns.indexOf('name');
        const idIdx = ubicacionesData.columns.indexOf('id');
        for (const row of ubicacionesData.rows) {
          if (row[idIdx]) ubicaciones.set(row[idIdx], row[nameIdx] || '');
        }
      }

      // Product relationships
      const productCategories = new Map<string, string[]>();
      if (productCategoriesData) {
        const prodIdx = productCategoriesData.columns.indexOf('product_id');
        const catIdx = productCategoriesData.columns.indexOf('category_id');
        for (const row of productCategoriesData.rows) {
          const pid = row[prodIdx];
          const cid = row[catIdx];
          if (pid && cid) {
            if (!productCategories.has(pid)) productCategories.set(pid, []);
            productCategories.get(pid)!.push(cid);
          }
        }
      }

      const productFiles = new Map<string, { fileId: string; order: number }[]>();
      if (productFilesData) {
        const prodIdx = productFilesData.columns.indexOf('product_id');
        const fileIdIdx = productFilesData.columns.indexOf('file_id');
        const orderIdx = productFilesData.columns.indexOf('sorting_order');
        for (const row of productFilesData.rows) {
          const pid = row[prodIdx];
          const fid = row[fileIdIdx];
          if (pid && fid) {
            if (!productFiles.has(pid)) productFiles.set(pid, []);
            productFiles.get(pid)!.push({ fileId: fid, order: parseInt(row[orderIdx]) || 0 });
          }
        }
      }

      const productUbicaciones = new Map<string, string[]>();
      if (productUbicacionesData) {
        const prodIdx = productUbicacionesData.columns.indexOf('product_id');
        const ubIdx = productUbicacionesData.columns.indexOf('ubicacion_id');
        for (const row of productUbicacionesData.rows) {
          const pid = row[prodIdx];
          const uid = row[ubIdx];
          if (pid && uid) {
            if (!productUbicaciones.has(pid)) productUbicaciones.set(pid, []);
            productUbicaciones.get(pid)!.push(uid);
          }
        }
      }

      // Transform products
      const products: MigrationProduct[] = [];
      if (productsData) {
        const cols = productsData.columns;
        const getIdx = (name: string) => cols.indexOf(name);

        for (const row of productsData.rows) {
          const djangoId = row[getIdx('id')];
          if (!djangoId) continue;

          const brandId = row[getIdx('brand_id')];
          const brandName = (brandId && brands.get(brandId)) || 'Sin marca';
          
          const catIds = productCategories.get(djangoId) || [];
          const categoryNames = catIds.map(id => categories.get(id)).filter(Boolean) as string[];

          const fileEntries = productFiles.get(djangoId) || [];
          fileEntries.sort((a, b) => a.order - b.order);
          const imageUrls = fileEntries
            .map(e => {
              const filePath = fileMap.get(e.fileId);
              return filePath ? `${baseUrl}${filePath}` : null;
            })
            .filter(Boolean) as string[];

          const ubIds = productUbicaciones.get(djangoId) || [];
          const locationNames = ubIds.map(id => ubicaciones.get(id)).filter(Boolean) as string[];
          const location = locationNames.length > 0 ? locationNames[0] : null;

          const status = parseVal(row[getIdx('status')]);
          const price = parseVal(row[getIdx('price')]);
          const regularPrice = parseVal(row[getIdx('regular_price')]);
          const quantity = parseVal(row[getIdx('quantity')]);
          const sku = parseVal(row[getIdx('sku')]) || `DJANGO-${djangoId}`;
          const condition = parseVal(row[getIdx('condition')]);
          const ofertar = row[getIdx('ofertar')] === 't';

          const description = parseVal(row[getIdx('description')]);

          products.push({
            id: `django-${djangoId}`,
            sku,
            title: parseVal(row[getIdx('name')]) || 'Sin título',
            description,
            brand: brandName,
            price: price ? parseFloat(price) : null,
            original_price: regularPrice ? parseFloat(regularPrice) : null,
            stock: quantity ? parseInt(quantity) : 1,
            is_active: status === 'published',
            is_new: condition === 'never_used',
            categories: categoryNames.length > 0 ? categoryNames : ['Sin categoría'],
            images: imageUrls,
            location,
            created_at: parseVal(row[getIdx('created_at')]),
            updated_at: parseVal(row[getIdx('updated_at')]),
            contact_for_quote: !price || parseFloat(price || '0') === 0 || ofertar,
          });
        }
      }

      const parsed: ParsedData = {
        brands, categories, files: fileMap, ubicaciones,
        productCategories, productFiles, productUbicaciones, products,
      };

      setParsedData(parsed);
      setMigrationProducts(products);
      toast.success(`Parseados ${products.length} productos, ${brands.size} marcas, ${categories.size} categorías, ${fileMap.size} archivos`);
    } catch (error) {
      console.error('Parse error:', error);
      toast.error('Error al parsear los archivos SQL');
    } finally {
      setParsing(false);
    }
  }, [files, baseUrl]);

  const startMigration = useCallback(async () => {
    if (migrationProducts.length === 0) return;

    setInserting(true);
    pauseRef.current = false;
    setIsPaused(false);
    setInsertProgress(0);
    setInsertResults({ success: 0, errors: 0, skipped: 0 });

    const BATCH_SIZE = 50;
    let success = 0;
    let errors = 0;
    let skipped = 0;

    for (let i = 0; i < migrationProducts.length; i += BATCH_SIZE) {
      if (pauseRef.current) {
        toast.info('Migración pausada');
        break;
      }

      const batch = migrationProducts.slice(i, i + BATCH_SIZE);
      const records = batch.map(p => ({
        id: p.id,
        sku: p.sku,
        title: p.title,
        description: p.description,
        brand: p.brand,
        price: p.price,
        original_price: p.original_price,
        stock: p.stock,
        is_active: p.is_active,
        is_new: p.is_new,
        categories: p.categories,
        images: p.images,
        location: p.location,
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
        contact_for_quote: p.contact_for_quote,
      }));

      const { error } = await supabase
        .from('products')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        console.error('Batch insert error:', error);
        errors += batch.length;
        // Try one by one
        for (const record of records) {
          const { error: singleError } = await supabase
            .from('products')
            .upsert(record, { onConflict: 'id' });
          if (singleError) {
            console.error(`Error inserting ${record.id}:`, singleError.message);
            errors++;
            success--; // correct the batch count
          } else {
            success++;
            errors--; // correct the batch count
          }
        }
      } else {
        success += batch.length;
      }

      const progress = Math.min(100, ((i + BATCH_SIZE) / migrationProducts.length) * 100);
      setInsertProgress(progress);
      setInsertResults({ success, errors, skipped });
    }

    setInsertProgress(100);
    setInserting(false);
    toast.success(`Migración completada: ${success} exitosos, ${errors} errores`);
  }, [migrationProducts]);

  const togglePause = () => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(!isPaused);
  };

  const stats = parsedData ? {
    products: migrationProducts.length,
    active: migrationProducts.filter(p => p.is_active).length,
    withImages: migrationProducts.filter(p => p.images.length > 0).length,
    withPrice: migrationProducts.filter(p => p.price && p.price > 0).length,
    brands: parsedData.brands.size,
    categories: parsedData.categories.size,
    files: parsedData.files.size,
  } : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Migración desde Django</h1>
        <p className="text-muted-foreground">Importa productos desde el dump SQL de Django</p>
      </div>

      {/* Step 1: Upload Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Paso 1: Subir archivos SQL</CardTitle>
          <CardDescription>Sube los 3 archivos .sql del dump de Django</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['part1', 'part2', 'part3'] as const).map((part, i) => (
              <div key={part} className="space-y-2">
                <label className="text-sm font-medium">Part {i + 1}</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${files[part] ? 'border-green-500 bg-green-500/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}>
                  {files[part] ? (
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm truncate">{files[part]!.name}</span>
                      <span className="text-xs text-muted-foreground">({(files[part]!.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Seleccionar archivo</span>
                      <input
                        type="file"
                        accept=".sql"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(part, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">URL base de imágenes</label>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://mercadoindustrial.com.mx/media/"
              />
            </div>
            <Button onClick={parseFiles} disabled={parsing || (!files.part1 && !files.part2)}>
              {parsing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Parseando...</> : <><Database className="h-4 w-4 mr-2" /> Parsear archivos</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Stats & Preview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Paso 2: Resumen de datos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              {[
                { label: 'Productos', value: stats.products, icon: Database },
                { label: 'Activos', value: stats.active, icon: CheckCircle },
                { label: 'Con imágenes', value: stats.withImages, icon: Image },
                { label: 'Con precio', value: stats.withPrice, icon: Tag },
                { label: 'Marcas', value: stats.brands, icon: Tag },
                { label: 'Categorías', value: stats.categories, icon: Tag },
                { label: 'Archivos', value: stats.files, icon: FileText },
              ].map(s => (
                <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <s.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold">{s.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Preview some products */}
            <h3 className="font-semibold mb-3">Vista previa (primeros 20)</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {migrationProducts.slice(0, 20).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setPreviewProduct(product)}
                  >
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Image className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{product.brand}</span>
                        <span>•</span>
                        <span>{product.sku}</span>
                        <span>•</span>
                        <span>{product.images.length} imgs</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {product.price ? (
                        <span className="font-semibold text-sm">${product.price.toLocaleString()}</span>
                      ) : (
                        <Badge variant="outline" className="text-xs">Cotizar</Badge>
                      )}
                    </div>
                    <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Preview modal */}
      {previewProduct && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{previewProduct.title}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setPreviewProduct(null)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-2 text-sm">
                  <p><strong>ID:</strong> {previewProduct.id}</p>
                  <p><strong>SKU:</strong> {previewProduct.sku}</p>
                  <p><strong>Marca:</strong> {previewProduct.brand}</p>
                  <p><strong>Precio:</strong> {previewProduct.price ? `$${previewProduct.price.toLocaleString()}` : 'Cotizar'}</p>
                  <p><strong>Precio original:</strong> {previewProduct.original_price ? `$${previewProduct.original_price.toLocaleString()}` : '-'}</p>
                  <p><strong>Stock:</strong> {previewProduct.stock}</p>
                  <p><strong>Activo:</strong> {previewProduct.is_active ? 'Sí' : 'No'}</p>
                  <p><strong>Nuevo:</strong> {previewProduct.is_new ? 'Sí' : 'No'}</p>
                  <p><strong>Ubicación:</strong> {previewProduct.location || '-'}</p>
                  <p><strong>Categorías:</strong> {previewProduct.categories.join(', ')}</p>
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">Imágenes ({previewProduct.images.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {previewProduct.images.slice(0, 9).map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block group">
                      <div className="w-full aspect-square rounded border overflow-hidden bg-muted relative">
                        <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
                        <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-xs text-muted-foreground p-1">
                          <Image className="h-5 w-5 mb-1" />
                          <span className="truncate w-full text-center">Error al cargar</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-1 group-hover:text-primary">{img.split('/').pop()}</p>
                    </a>
                  ))}
                </div>
                {previewProduct.images.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">URLs de imágenes:</p>
                    <div className="bg-muted/50 rounded p-2 max-h-32 overflow-auto space-y-1">
                      {previewProduct.images.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-primary hover:underline truncate">{img}</a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {previewProduct.description && (
              <div className="mt-4">
                <p className="font-medium mb-1">Descripción (HTML raw)</p>
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded max-h-40 overflow-auto" dangerouslySetInnerHTML={{ __html: previewProduct.description }} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Migrate */}
      {migrationProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Play className="h-5 w-5" /> Paso 3: Ejecutar migración</CardTitle>
            <CardDescription>
              Se insertarán {migrationProducts.length.toLocaleString()} productos en lotes de 50
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inserting && (
              <div className="space-y-2">
                <Progress value={insertProgress} />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{insertProgress.toFixed(0)}%</span>
                  <div className="flex gap-4">
                    <span className="text-green-600">✓ {insertResults.success}</span>
                    <span className="text-red-600">✗ {insertResults.errors}</span>
                  </div>
                </div>
              </div>
            )}

            {!inserting && insertResults.success > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium">Migración completada</p>
                  <p className="text-sm text-muted-foreground">
                    {insertResults.success} exitosos, {insertResults.errors} errores
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={startMigration} disabled={inserting && !isPaused} size="lg">
                {inserting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Insertando...</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> Iniciar migración</>
                )}
              </Button>
              {inserting && (
                <Button variant="outline" onClick={togglePause}>
                  {isPaused ? <><Play className="h-4 w-4 mr-2" /> Continuar</> : <><Pause className="h-4 w-4 mr-2" /> Pausar</>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminMigracion;
