import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThumbsUp, CheckCircle2 } from 'lucide-react';

interface Review {
  id: string;
  username: string;
  reviewCount: number;
  timeAgo: string;
  comment: string;
  isVerified: boolean;
  category?: string;
  rating?: 'positive' | 'neutral' | 'negative';
}

interface SellerReviewsProps {
  productReviewCount: number;
  totalReviewCount: number;
  reviews: Review[];
}

const categoryFilters = [
  { id: 'all', label: 'Todas' },
  { id: 'calidad', label: 'Calidad' },
  { id: 'valor', label: 'Valor' },
  { id: 'satisfaccion', label: 'Satisfacción' },
  { id: 'aspecto', label: 'Aspecto' },
  { id: 'estado', label: 'Estado' },
  { id: 'uso', label: 'Uso' },
];

export const SellerReviews = ({ 
  productReviewCount, 
  totalReviewCount, 
  reviews 
}: SellerReviewsProps) => {
  const [activeTab, setActiveTab] = useState<'product' | 'all'>('all');
  const [selectedFilter, setSelectedFilter] = useState('todas');
  const [activeCategory, setActiveCategory] = useState('all');

  const maskUsername = (username: string) => {
    if (username.length <= 3) return username;
    return username[0] + '***' + username.slice(-1);
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <h3 className="font-display font-bold text-xl mb-6">
        Comentarios del vendedor{' '}
        <span className="text-muted-foreground font-normal">
          ({totalReviewCount.toLocaleString('es-MX')})
        </span>
      </h3>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('product')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'product' 
              ? 'text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Este artículo ({productReviewCount})
          {activeTab === 'product' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'all' 
              ? 'text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Todos los artículos ({totalReviewCount.toLocaleString('es-MX')})
          {activeTab === 'all' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtro: Todas las valoraciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las valoraciones</SelectItem>
            <SelectItem value="positivas">Valoraciones positivas</SelectItem>
            <SelectItem value="neutras">Valoraciones neutras</SelectItem>
            <SelectItem value="negativas">Valoraciones negativas</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className={activeCategory === cat.id ? '' : 'hover:bg-muted'}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews
          .filter((review) => {
            // Filter by category
            if (activeCategory !== 'all' && review.category) {
              if (review.category.toLowerCase() !== activeCategory.toLowerCase()) return false;
            }
            // Filter by rating type
            if (selectedFilter === 'positivas' && review.rating !== 'positive') return false;
            if (selectedFilter === 'neutras' && review.rating !== 'neutral') return false;
            if (selectedFilter === 'negativas' && review.rating !== 'negative') return false;
            return true;
          })
          .map((review) => (
          <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <ThumbsUp size={12} className="text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {maskUsername(review.username)} ({review.reviewCount})
                </span>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{review.timeAgo}</span>
              </div>
              {review.isVerified && (
                <Badge variant="secondary" className="shrink-0 text-xs gap-1">
                  <CheckCircle2 size={12} />
                  Compra verificada
                </Badge>
              )}
            </div>
            <p className="text-foreground">{review.comment}</p>
          </div>
        ))}
      </div>

      {/* Load More */}
      {reviews.length > 0 && (
        <div className="mt-6 text-center">
          <Button variant="outline">
            Ver más comentarios
          </Button>
        </div>
      )}
    </div>
  );
};
