import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  MessageCircle, 
  Heart, 
  Store,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { useConversations } from '@/hooks/useConversations';

interface SellerRating {
  label: string;
  score: number;
}

interface SellerProfileCardProps {
  seller: {
    id: string;
    name: string;
    avatar?: string;
    positivePercentage: number;
    totalSales: number;
    joinedDate: string;
    description: string;
    ratings: SellerRating[];
  };
  productId?: string;
  sellerId?: string;
}

export const SellerProfileCard = ({ seller, productId, sellerId }: SellerProfileCardProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { startConversation, isCreating } = useConversations();
  
  const truncatedDescription = seller.description.length > 150 
    ? seller.description.slice(0, 150) + '...' 
    : seller.description;

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + ' K';
    }
    return num.toString();
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <h3 className="font-display font-bold text-xl mb-6">
        Más información sobre este vendedor
      </h3>

      {/* Seller Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden border border-border p-1">
          {seller.avatar ? (
            <img src={seller.avatar} alt={seller.name} className="w-full h-full object-contain" />
          ) : (
            <Store size={28} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-lg text-foreground truncate">{seller.name}</h4>
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">{seller.positivePercentage}%</span> de comentarios positivos
          </p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(seller.totalSales)} artículos vendidos
          </p>
        </div>
      </div>

      {/* Join Date */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Calendar size={16} />
        <span>Se unió en {seller.joinedDate}</span>
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {showFullDescription ? seller.description : truncatedDescription}
        </p>
        {seller.description.length > 150 && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary mt-2 transition-colors"
          >
            {showFullDescription ? 'Ver menos' : 'Ver más'}
            {showFullDescription ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        <Button asChild className="w-full">
          <Link to={`/catalogo-mi?vendedor=${seller.id}`}>
            <Store size={18} className="mr-2" />
            Visitar tienda
          </Link>
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => productId && sellerId && startConversation(productId, sellerId)}
          disabled={isCreating || !productId || !sellerId}
        >
          {isCreating ? (
            <Loader2 size={18} className="mr-2 animate-spin" />
          ) : (
            <MessageCircle size={18} className="mr-2" />
          )}
          Contactar
        </Button>
        <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">
          <Heart size={18} className="mr-2" />
          Guardar vendedor
        </Button>
      </div>

      {/* Detailed Ratings */}
      <div className="border-t border-border pt-6">
        <h4 className="font-display font-bold text-lg mb-4">
          Valoraciones detalladas sobre el vendedor
        </h4>
        <div className="space-y-4">
          {seller.ratings.map((rating, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground flex-1 min-w-0">
                {rating.label}
              </span>
              <div className="w-24 shrink-0">
                <Progress value={rating.score * 20} className="h-2" />
              </div>
              <span className="text-sm font-semibold w-8 text-right">
                {rating.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
