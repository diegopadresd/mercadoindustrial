import { useState } from 'react';
import { DollarSign, MessageSquare, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateOffer } from '@/hooks/useOffers';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface MakeOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    title: string;
    price?: number | null;
    seller_id?: string | null;
  };
}

export const MakeOfferModal = ({ open, onOpenChange, product }: MakeOfferModalProps) => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createOffer = useCreateOffer();
  
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para hacer una oferta.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (user.id === product.seller_id) {
      toast({
        title: 'Error',
        description: 'No puedes hacer una oferta en tu propio producto.',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Monto inválido',
        description: 'Ingresa un monto válido para tu oferta.',
        variant: 'destructive',
      });
      return;
    }

    await createOffer.mutateAsync({
      product_id: product.id,
      offer_price: amount,
      original_price: product.price || null,
      user_id: user.id,
      customer_name: profile.full_name || 'Cliente',
      customer_email: profile.email,
      customer_phone: profile.phone || undefined,
    });

    setOfferAmount('');
    setMessage('');
    onOpenChange(false);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inicia sesión para ofertar</DialogTitle>
            <DialogDescription>
              Necesitas una cuenta para hacer ofertas en productos.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                onOpenChange(false);
                navigate('/auth');
              }}
              className="flex-1 btn-gold"
            >
              Iniciar sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="text-primary" size={20} />
            Hacer una oferta
          </DialogTitle>
          <DialogDescription>
            Envía tu oferta para "{product.title}". El vendedor revisará tu propuesta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Current Price Reference */}
          {product.price && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Precio actual</p>
              <p className="text-lg font-bold">
                ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Offer Amount */}
          <div className="space-y-2">
            <Label htmlFor="offerAmount">Tu oferta (MXN)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="offerAmount"
                type="number"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="pl-9"
                min="1"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare size={14} />
              Mensaje (opcional)
            </Label>
            <Textarea
              id="message"
              placeholder="Agrega un mensaje para el vendedor..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={createOffer.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="flex-1 btn-gold"
              disabled={createOffer.isPending}
            >
              {createOffer.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar oferta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
