import { useState, useEffect } from 'react';
import { Settings, Bell, Loader2, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useUserRole } from '@/hooks/useUserRole';
import AccessDenied from '@/components/admin/AccessDenied';

const AdminAjustes = () => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { 
    announcementSettings, 
    isLoading: settingsLoading, 
    updateAnnouncement, 
    isUpdating 
  } = useSiteSettings();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState('');
  const [validationError, setValidationError] = useState('');

  // Sync state with fetched settings
  useEffect(() => {
    if (announcementSettings) {
      setEnabled(announcementSettings.enabled);
      setText(announcementSettings.text || '');
    }
  }, [announcementSettings]);

  const handleSave = () => {
    // Validation
    if (enabled && (!text || text.trim().length < 5)) {
      setValidationError('El texto del anuncio es obligatorio (mínimo 5 caracteres).');
      return;
    }
    setValidationError('');

    updateAnnouncement(
      { enabled, text: text.trim() },
      {
        onSuccess: () => {
          toast({
            title: 'Guardado correctamente',
            description: 'La configuración del anuncio ha sido actualizada.',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Error al guardar',
            description: error.message || 'No se pudo guardar la configuración.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (roleLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied message="Solo los administradores pueden acceder a los ajustes del sistema." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2">
          <Settings className="text-primary" />
          Ajustes
        </h1>
        <p className="text-muted-foreground">
          Configuración general del sitio
        </p>
      </div>

      {/* Welcome Announcement Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            Anuncio de bienvenida
          </CardTitle>
          <CardDescription>
            Configura un anuncio emergente que aparecerá a todos los visitantes al entrar al sitio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="announcement-toggle" className="text-base font-medium">
                Activar anuncio al entrar
              </Label>
              <p className="text-sm text-muted-foreground">
                Cuando está activo, el anuncio aparecerá como un overlay al visitar el sitio.
              </p>
            </div>
            <Switch
              id="announcement-toggle"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {/* Text Area */}
          <div className="space-y-2">
            <Label htmlFor="announcement-text">Texto del anuncio</Label>
            <Textarea
              id="announcement-text"
              placeholder="Escribe el mensaje que verán los visitantes..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (validationError) setValidationError('');
              }}
              rows={4}
              className={validationError ? 'border-destructive' : ''}
            />
            {validationError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle size={14} />
                {validationError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {text.length} caracteres
            </p>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={isUpdating}
            className="btn-gold"
          >
            {isUpdating ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Guardar cambios
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAjustes;
