import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, LinkIcon, FileText } from 'lucide-react';
import AdminImportClients from './AdminImportClients';
import AdminImportSlugs from './AdminImportSlugs';
import AdminAuditoriaEnlaces from './AdminAuditoriaEnlaces';

export default function AdminHerramientas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Herramientas</h1>
        <p className="text-muted-foreground">Importación de datos y auditoría del sitio</p>
      </div>

      <Tabs defaultValue="clientes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clientes" className="gap-2">
            <Upload size={16} />
            Importar Clientes
          </TabsTrigger>
          <TabsTrigger value="slugs" className="gap-2">
            <FileText size={16} />
            Importar Slugs
          </TabsTrigger>
          <TabsTrigger value="enlaces" className="gap-2">
            <LinkIcon size={16} />
            Auditoría Enlaces
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes">
          <AdminImportClients />
        </TabsContent>
        <TabsContent value="slugs">
          <AdminImportSlugs />
        </TabsContent>
        <TabsContent value="enlaces">
          <AdminAuditoriaEnlaces />
        </TabsContent>
      </Tabs>
    </div>
  );
}
