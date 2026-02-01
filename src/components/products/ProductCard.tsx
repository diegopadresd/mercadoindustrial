import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, MapPin, Gavel, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  id: string;
  title: string;
  sku: string;
  brand: string;
  price?: number | null;
  image: string;
  location?: string;
  categories: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  isAuction?: boolean;
  auctionMinPrice?: number | null;
  auctionEnd?: string | null;
  contactForQuote?: boolean;
}

export const ProductCard = ({
  id,
  title,
  sku,
  brand,
  price,
  image,
  location,
  categories,
  isNew,
  isFeatured,
  isAuction,
  auctionMinPrice,
  auctionEnd,
  contactForQuote,
}: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't add auction products to cart
    if (isAuction) return;
    
    await addToCart({
      productId: id,
      title,
      sku,
      brand,
      price,
      image,
    });
  };

  const handleQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to cart for quote
    addToCart({
      productId: id,
      title,
      sku,
      brand,
      price: null,
      image,
    });
  };

  // Check if auction is active
  const auctionEndDate = auctionEnd ? new Date(auctionEnd) : null;
  const isAuctionActive = isAuction && auctionEndDate && auctionEndDate > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="product-card group"
    >
      {/* Image Container */}
      <Link to={`/productos/${id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isAuction && (
            <Badge className="bg-primary text-primary-foreground">
              <Gavel size={12} className="mr-1" />
              Subasta
            </Badge>
          )}
          {isNew && <span className="badge-new">Nuevo</span>}
          {isFeatured && <span className="badge-featured">Destacado</span>}
          {!isAuction && categories.slice(0, 2).map((cat) => (
            <span key={cat} className="badge-category">{cat}</span>
          ))}
        </div>

        {/* Watermark */}
        <div className="absolute bottom-3 right-3 opacity-50">
          <span className="text-xs font-display font-bold text-white drop-shadow-lg">
            MERCADO INDUSTRIAL
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/productos/${id}`}>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground/70">Sku</span>
            <span className="font-medium text-foreground">{sku}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground/70">Marca</span>
            <span className="font-medium text-foreground">{brand}</span>
          </div>
          
          {/* Price display logic */}
          {isAuction ? (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground/70">Compra ya</span>
                <span className="font-bold text-primary text-lg">
                  ${auctionMinPrice?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {auctionEndDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer size={12} />
                  <span>
                    {isAuctionActive 
                      ? `Termina: ${auctionEndDate.toLocaleDateString('es-MX')}`
                      : 'Finalizada'
                    }
                  </span>
                </div>
              )}
            </>
          ) : contactForQuote || !price ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground/70">Precio</span>
              <span className="font-medium text-secondary">Cotizar</span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-muted-foreground/70">Precio</span>
              <span className="font-bold text-primary text-lg">
                ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isAuction ? (
            <Button 
              asChild
              size="sm" 
              className="w-full btn-gold"
            >
              <Link to={`/productos/${id}`}>
                <Gavel size={16} className="mr-1" />
                Ver subasta
              </Link>
            </Button>
          ) : contactForQuote || !price ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleQuote}
              >
                <ShoppingCart size={16} className="mr-1" />
                Agregar
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                onClick={handleQuote}
              >
                Cotizar
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={16} className="mr-1" />
                Agregar
              </Button>
              <Button 
                size="sm" 
                className="flex-1 btn-gold"
                onClick={handleAddToCart}
              >
                Comprar
              </Button>
            </>
          )}
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <MapPin size={12} />
            <span>{location}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
