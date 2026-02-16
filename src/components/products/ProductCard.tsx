import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, MapPin, Gavel, Timer, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Badge } from '@/components/ui/badge';
import { generateProductUrl } from '@/lib/slugify';

export interface ProductCardProps {
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
  isExternal?: boolean; // Product from external seller
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
  isExternal,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { formatPrice, t, language } = useLocale();

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
      <Link to={generateProductUrl(title, id)} className="block relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isExternal && (
            <Badge className="bg-amber-500 text-white">
              <Store size={12} className="mr-1" />
              {language === 'es' ? 'Externo' : 'External'}
            </Badge>
          )}
          {isAuction && (
            <Badge className="bg-primary text-primary-foreground">
              <Gavel size={12} className="mr-1" />
              {language === 'es' ? 'Subasta' : 'Auction'}
            </Badge>
          )}
          {isNew && <span className="badge-new">{language === 'es' ? 'Nuevo' : 'New'}</span>}
          {isFeatured && <span className="badge-featured">{language === 'es' ? 'Destacado' : 'Featured'}</span>}
          {!isAuction && !isExternal && categories.slice(0, 2).map((cat) => (
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
        <Link to={generateProductUrl(title, id)}>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground/70">{t('product.sku')}</span>
            <span className="font-medium text-foreground">{sku}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground/70">{t('product.brand')}</span>
            <span className="font-medium text-foreground">{brand}</span>
          </div>
          
          {/* Price display logic */}
          {isAuction ? (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground/70">{t('auction.buyNow')}</span>
                <span className="font-bold text-primary text-lg">
                  {formatPrice(auctionMinPrice)}
                </span>
              </div>
              {auctionEndDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer size={12} />
                  <span>
                    {isAuctionActive 
                      ? `${t('auction.endsIn')}: ${auctionEndDate.toLocaleDateString('es-MX')}`
                      : t('auction.ended')
                    }
                  </span>
                </div>
              )}
            </>
          ) : contactForQuote || !price ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground/70">{t('product.price')}</span>
              <span className="font-medium text-secondary">{t('common.requestQuote')}</span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-muted-foreground/70">{t('product.price')}</span>
              <span className="font-bold text-primary text-lg">
                {formatPrice(price)}
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
              <Link to={generateProductUrl(title, id)}>
                <Gavel size={16} className="mr-1" />
                {t('auction.bidNow')}
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
                {t('common.addToCart')}
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                onClick={handleQuote}
              >
                {t('common.requestQuote')}
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
                {t('common.addToCart')}
              </Button>
              <Button 
                size="sm" 
                className="flex-1 btn-gold"
                onClick={handleAddToCart}
              >
                {t('common.buyNow')}
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
