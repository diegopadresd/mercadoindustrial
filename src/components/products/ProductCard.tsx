import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, MapPin, Gavel, Timer, Store, DollarSign, FileText, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  isExternal?: boolean;
  allowOffers?: boolean;
  stock?: number;
  slug?: string | null;
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
  allowOffers,
  stock = 1,
  slug,
}: ProductCardProps) => {
  const { addToCart, items } = useCart();
  const { formatPrice, t, language } = useLocale();
  const navigate = useNavigate();
  const [cotizarOpen, setCotizarOpen] = useState(false);

  const cartItem = items.find(item => item.productId === id);
  const currentQtyInCart = cartItem?.quantity ?? 0;
  const isAtStockLimit = currentQtyInCart >= stock;

  // Use stored slug if available, otherwise fallback to slugifying title
  const productUrl = slug
    ? generateProductUrl(slug, id, true)
    : generateProductUrl(title, id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuction || isAtStockLimit) return;
    await addToCart({ productId: id, title, sku, brand, price, image, slug: slug || null });
  };

  const handleCotizar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCotizarOpen(true);
  };

  const handleAddToCartFromDialog = async () => {
    await addToCart({ productId: id, title, sku, brand, price, image, slug: slug || null });
    setCotizarOpen(false);
  };

  const auctionEndDate = auctionEnd ? new Date(auctionEnd) : null;
  const isAuctionActive = isAuction && auctionEndDate && auctionEndDate > new Date();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="product-card group"
      >
        {/* Image Container */}
        <Link to={productUrl} className="block relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
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
              <Link
                key={cat}
                to={`/catalogo-mi?categoria=${encodeURIComponent(cat)}`}
                onClick={e => e.stopPropagation()}
                className="badge-category hover:opacity-80 transition-opacity"
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Stock warning */}
          {stock <= 3 && stock > 0 && (
            <div className="absolute bottom-10 left-3">
              <Badge variant="destructive" className="text-xs">
                Solo {stock} disponible{stock !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}

          {/* Watermark */}
          <div className="absolute bottom-3 right-3 opacity-50">
            <span className="text-xs font-display font-bold text-white drop-shadow-lg">
              MERCADO INDUSTRIAL
            </span>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          <Link to={productUrl}>
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
          <div className="flex gap-2 flex-col">
            {isAuction ? (
              <Button 
                asChild
                size="sm" 
                className="w-full btn-gold"
              >
                <Link to={productUrl}>
                  <Gavel size={16} className="mr-1" />
                  {t('auction.bidNow')}
                </Link>
              </Button>
            ) : contactForQuote || !price ? (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  variant="outline"
                  onClick={handleAddToCart}
                  disabled={isAtStockLimit}
                  title={isAtStockLimit ? 'Stock máximo alcanzado' : undefined}
                >
                  <ShoppingCart size={14} className="mr-1" />
                  Carrito
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  onClick={handleCotizar}
                >
                  <FileText size={14} className="mr-1" />
                  Cotizar
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isAtStockLimit}
                  title={isAtStockLimit ? 'Stock máximo alcanzado' : undefined}
                >
                  <ShoppingCart size={16} className="mr-1" />
                  {t('common.addToCart')}
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 btn-gold"
                  onClick={handleCotizar}
                >
                  <FileText size={14} className="mr-1" />
                  Cotizar
                </Button>
              </div>
            )}

            {/* Offer button — only if allow_offers is true */}
            {allowOffers && !isAuction && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full border-secondary text-secondary hover:bg-secondary/10"
              >
                <Link to={productUrl}>
                  <DollarSign size={14} className="mr-1" />
                  Hacer una oferta
                </Link>
              </Button>
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

      {/* Cotizar Dialog */}
      <Dialog open={cotizarOpen} onOpenChange={setCotizarOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Cotizar producto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="font-semibold text-foreground line-clamp-2 mb-1">{title}</p>
              <p className="text-sm text-muted-foreground">SKU: {sku} · {brand}</p>
              {price ? (
                <p className="text-primary font-bold mt-1">{formatPrice(price)}</p>
              ) : (
                <p className="text-secondary font-medium text-sm mt-1">Precio por cotizar</p>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              ¿Cómo deseas cotizar este producto?
            </p>

            <div className="flex flex-col gap-3">
              <Button
                className="w-full btn-gold"
                onClick={handleAddToCartFromDialog}
                disabled={isAtStockLimit}
              >
                <ShoppingCart size={16} className="mr-2" />
                Agregar al carrito para cotizar
              </Button>

              <Button
                variant="outline"
                className="w-full"
                asChild
                onClick={() => setCotizarOpen(false)}
              >
                <Link to={`/cotizador?productoId=${id}`}>
                  <Truck size={16} className="mr-2" />
                  Cotizador de fletes →
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                asChild
                onClick={() => setCotizarOpen(false)}
              >
                <Link to={productUrl}>
                  Ver ficha completa del producto
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
