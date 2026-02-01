import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
  message?: string;
}

const AccessDenied = ({ message = 'No tienes permiso para acceder a esta sección.' }: AccessDeniedProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-foreground">
            Acceso Restringido
          </h2>
          <p className="text-muted-foreground">
            {message}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft size={16} />
            Volver
          </Button>
          <Button onClick={() => navigate('/')}>
            Ir al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
