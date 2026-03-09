import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Timer, Gavel, DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBids, useHighestBid, usePlaceBid, useBuyNow, useFinalizeAuction } from '@/hooks/useBids';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuctionSectionProps {
  product: {
    id: string;
    seller_id?: string | null;
    is_auction?: boolean;
    auction_min_price?: number | null;
    auction_start?: string | null;
    auction_end?: string | null;
    auction_status?: string | null;
  };
}

export const AuctionSection = ({ product }: AuctionSectionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const finalizedRef = useRef(false);
  
  const { data: bids } = useBids(product.id);
  const { data: highestBid } = useHighestBid(product.id);
  const placeBid = usePlaceBid();
  const buyNow = useBuyNow();
  const finalizeAuction = useFinalizeAuction();

  const auctionStart = product.auction_start ? new Date(product.auction_start) : null;
  const auctionEnd = product.auction_end ? new Date(product.auction_end) : null;

  const auctionState = useMemo(() => {
    const now = new Date();
    
    if (product.auction_status === 'sold') return 'sold';
    if (product.auction_status === 'ended_valid') return 'ended_valid';
    if (product.auction_status === 'ended_invalid') return 'ended_invalid';
    
    if (auctionStart && now < auctionStart) return 'scheduled';
    if (auctionEnd && now > auctionEnd) return 'ended';
    if (auctionStart && auctionEnd && now >= auctionStart && now <= auctionEnd) return 'active';
    
    return 'inactive';
  }, [product.auction_status, auctionStart, auctionEnd]);

  // Check and finalize auction when viewing — guard with ref to prevent spam on every re-render
  useEffect(() => {
    if (auctionState === 'ended' && product.id && !finalizedRef.current && !finalizeAuction.isPending && !finalizeAuction.isSuccess) {
      finalizedRef.current = true;
      finalizeAuction.mutate(product.id);
    }
  }, [auctionState, product.id, finalizeAuction.isPending, finalizeAuction.isSuccess]);

  // Countdown timer
  useEffect(() => {
    if (auctionState !== 'active' && auctionState !== 'scheduled') return;

    const targetDate = auctionState === 'scheduled' ? auctionStart : auctionEnd;
    if (!targetDate) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Finalizada');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auctionState, auctionStart, auctionEnd]);

  const handlePlaceBid = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Monto inválido',
        description: 'Ingresa un monto válido',
        variant: 'destructive',
      });
      return;
    }

    placeBid.mutate({
      productId: product.id,
      userId: user.id,
      amount,
    });
    setBidAmount('');
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    buyNow.mutate({
      productId: product.id,
      userId: user.id,
    });
  };

  const isOwner = user?.id === product.seller_id;
  const minBidAmount = highestBid ? highestBid.amount + 1 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gavel className="text-primary" size={24} />
          <h3 className="font-display font-bold text-xl">Subasta</h3>
        </div>
        <Badge 
          variant={auctionState === 'active' ? 'default' : 'secondary'}
          className={auctionState === 'active' ? 'bg-green-500' : ''}
        >
          {auctionState === 'scheduled' && 'Programada'}
          {auctionState === 'active' && 'En curso'}
          {auctionState === 'ended' && 'Finalizando...'}
          {auctionState === 'ended_valid' && 'Vendida'}
          {auctionState === 'ended_invalid' && 'Sin venta'}
          {auctionState === 'sold' && 'Vendida'}
        </Badge>
      </div>

      {/* Timer */}
      {(auctionState === 'active' || auctionState === 'scheduled') && (
        <div className="bg-background/50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Timer size={16} />
            <span className="text-sm">
              {auctionState === 'scheduled' ? 'Inicia en' : 'Tiempo restante'}
            </span>
          </div>
          <p className="text-2xl font-bold font-display text-primary">
            {timeRemaining}
          </p>
        </div>
      )}

      {/* Auction Info */}
      <div className="space-y-3 mb-4">
        {auctionStart && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Inicio:</span>
            <span>{new Date(auctionStart).toLocaleString('es-MX')}</span>
          </div>
        )}
        {auctionEnd && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fin:</span>
            <span>{new Date(auctionEnd).toLocaleString('es-MX')}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Compra ya por:</span>
          <span className="font-bold text-primary">
            ${product.auction_min_price?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Current Bid */}
      <div className="bg-background rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <DollarSign size={16} />
          <span className="text-sm">Puja actual</span>
        </div>
        {highestBid ? (
          <p className="text-2xl font-bold font-display">
            ${highestBid.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        ) : (
          <p className="text-lg text-muted-foreground">Sin pujas aún</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {bids?.length || 0} puja(s) en total
        </p>
      </div>

      {/* Auction State Messages */}
      {auctionState === 'scheduled' && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-4">
          <AlertTriangle size={18} />
          <span className="text-sm">La subasta aún no ha iniciado</span>
        </div>
      )}

      {auctionState === 'ended_valid' && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4">
          <CheckCircle size={18} />
          <span className="text-sm">¡Subasta finalizada con éxito!</span>
        </div>
      )}

      {auctionState === 'ended_invalid' && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
          <XCircle size={18} />
          <span className="text-sm">Subasta finalizada sin alcanzar precio mínimo</span>
        </div>
      )}

      {auctionState === 'sold' && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4">
          <CheckCircle size={18} />
          <span className="text-sm">Este producto ya fue vendido</span>
        </div>
      )}

      {/* Actions */}
      {auctionState === 'active' && !isOwner && (
        <div className="space-y-3">
          {/* Buy Now Button */}
          <Button 
            onClick={handleBuyNow}
            className="w-full btn-gold"
            size="lg"
            disabled={buyNow.isPending}
          >
            {buyNow.isPending ? 'Procesando...' : `Compra ya por $${product.auction_min_price?.toLocaleString('es-MX')}`}
          </Button>

          {/* Bid Input */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={`Mínimo $${minBidAmount.toLocaleString('es-MX')}`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min={minBidAmount}
              className="flex-1"
            />
            <Button 
              onClick={handlePlaceBid}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              disabled={placeBid.isPending}
            >
              {placeBid.isPending ? 'Pujando...' : 'Pujar'}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Tu puja debe ser mayor a ${minBidAmount.toLocaleString('es-MX')}
          </p>
        </div>
      )}

      {isOwner && (
        <div className="text-center text-muted-foreground text-sm p-3 bg-muted/50 rounded-lg">
          Este es tu producto. No puedes pujar ni comprarlo.
        </div>
      )}

      {!user && auctionState === 'active' && (
        <Button 
          onClick={() => navigate('/auth')}
          className="w-full"
          variant="outline"
        >
          Inicia sesión para pujar
        </Button>
      )}
    </motion.div>
  );
};
