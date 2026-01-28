import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  title: string;
  image: string;
  href: string;
  productCount?: number;
}

export const CategoryCard = ({ title, image, href, productCount }: CategoryCardProps) => {
  return (
    <Link to={href}>
      <motion.div
        whileHover={{ y: -5 }}
        className="category-card group relative aspect-square overflow-hidden rounded-2xl"
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="category-overlay absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-transparent opacity-80 transition-opacity" />
        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
          <h3 className="category-title font-display font-bold text-xl text-white transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
            {title}
          </h3>
          {productCount && (
            <p className="text-white/70 text-sm mt-1">{productCount} productos</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
};
