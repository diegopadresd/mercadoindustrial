import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Language = 'es' | 'en';
export type Currency = 'MXN' | 'USD';

interface LocaleContextType {
  language: Language;
  currency: Currency;
  exchangeRate: number; // USD to MXN rate
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  formatPrice: (priceMXN: number | null | undefined) => string;
  t: (key: string) => string;
  isLoadingRate: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANGUAGE: 'mercado-industrial-language',
  CURRENCY: 'mercado-industrial-currency',
  EXCHANGE_RATE: 'mercado-industrial-exchange-rate',
  RATE_TIMESTAMP: 'mercado-industrial-rate-timestamp',
};

// Rate cache duration: 1 hour
const RATE_CACHE_DURATION = 60 * 60 * 1000;

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (saved as Language) || 'es';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    return (saved as Currency) || 'MXN';
  });

  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE);
    return saved ? parseFloat(saved) : 17.5; // Default fallback rate
  });

  const [isLoadingRate, setIsLoadingRate] = useState(false);

  // Fetch exchange rate from API
  const fetchExchangeRate = useCallback(async () => {
    try {
      // Check if we have a cached rate that's still valid
      const cachedTimestamp = localStorage.getItem(STORAGE_KEYS.RATE_TIMESTAMP);
      const cachedRate = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE);
      
      if (cachedTimestamp && cachedRate) {
        const timestamp = parseInt(cachedTimestamp);
        if (Date.now() - timestamp < RATE_CACHE_DURATION) {
          setExchangeRate(parseFloat(cachedRate));
          return;
        }
      }

      setIsLoadingRate(true);
      
      const { data, error } = await supabase.functions.invoke('get-exchange-rate');
      
      if (error) throw error;
      
      if (data?.rate) {
        setExchangeRate(data.rate);
        localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATE, data.rate.toString());
        localStorage.setItem(STORAGE_KEYS.RATE_TIMESTAMP, Date.now().toString());
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Keep using cached or default rate
    } finally {
      setIsLoadingRate(false);
    }
  }, []);

  // Fetch exchange rate on mount
  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  // Save language preference
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    document.documentElement.lang = lang;
  }, []);

  // Save currency preference
  const setCurrency = useCallback((curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
  }, []);

  // Format price based on selected currency
  const formatPrice = useCallback((priceMXN: number | null | undefined): string => {
    if (priceMXN === null || priceMXN === undefined) {
      return language === 'es' ? 'Cotizar' : 'Request Quote';
    }

    if (currency === 'MXN') {
      return `$${priceMXN.toLocaleString('es-MX')} MXN`;
    } else {
      const priceUSD = priceMXN / exchangeRate;
      return `$${priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
    }
  }, [currency, exchangeRate, language]);

  // Translation function
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Spanish if key not found
        let fallback: any = translations['es'];
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return key if not found in either language
          }
        }
        return fallback;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [language]);

  // Set document language on mount
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LocaleContext.Provider value={{
      language,
      currency,
      exchangeRate,
      setLanguage,
      setCurrency,
      formatPrice,
      t,
      isLoadingRate,
    }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

// Translations object
const translations: Record<Language, Record<string, any>> = {
  es: {
    // Navigation
    nav: {
      home: 'Inicio',
      catalog: 'Catálogo',
      brands: 'Marcas',
      auctions: 'Subastas',
      marketplace: 'Marketplace',
      howToBuy: 'Cómo Comprar',
      howToSell: 'Cómo Vender',
      about: 'Nosotros',
      contact: 'Contacto',
      blog: 'Blog',
      faq: 'Preguntas Frecuentes',
      support: 'Soporte',
      cart: 'Carrito',
      myAccount: 'Mi Cuenta',
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      admin: 'Administración',
    },
    // Common
    common: {
      search: 'Buscar',
      searchPlaceholder: 'Buscar productos, marcas...',
      viewMore: 'Ver más',
      viewAll: 'Ver todo',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      yes: 'Sí',
      no: 'No',
      or: 'o',
      and: 'y',
      all: 'Todos',
      none: 'Ninguno',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      filters: 'Filtros',
      sortBy: 'Ordenar por',
      priceAsc: 'Menor precio',
      priceDesc: 'Mayor precio',
      newest: 'Más reciente',
      requestQuote: 'Cotizar',
      addToCart: 'Agregar al carrito',
      buyNow: 'Comprar ahora',
      contactUs: 'Contáctanos',
      language: 'Idioma',
      currency: 'Moneda',
    },
    // Home page
    home: {
      hero: {
        title: 'Maquinaria Industrial de Calidad',
        subtitle: 'Compra, vende y subasta equipos industriales con confianza',
        cta: 'Explorar Catálogo',
        ctaSecondary: 'Vender mi Equipo',
      },
      featured: 'Productos Destacados',
      categories: 'Categorías',
      recentProducts: 'Agregados Recientemente',
      partners: 'Marcas Aliadas',
      stats: {
        products: 'Productos',
        brands: 'Marcas',
        customers: 'Clientes',
        years: 'Años de experiencia',
      },
    },
    // Product
    product: {
      description: 'Descripción',
      specifications: 'Especificaciones',
      brand: 'Marca',
      model: 'Modelo',
      year: 'Año',
      condition: 'Condición',
      location: 'Ubicación',
      stock: 'Disponibles',
      sku: 'SKU',
      price: 'Precio',
      originalPrice: 'Precio original',
      discount: 'Descuento',
      outOfStock: 'Agotado',
      inStock: 'En existencia',
      shipping: 'Envío',
      freeShipping: 'Envío gratis',
      warranty: 'Garantía',
      questions: 'Preguntas',
      askQuestion: 'Hacer una pregunta',
      makeOffer: 'Hacer oferta',
      similarProducts: 'Productos similares',
      recentlyViewed: 'Vistos recientemente',
    },
    // Auction
    auction: {
      currentBid: 'Puja actual',
      startingBid: 'Puja inicial',
      minimumBid: 'Puja mínima',
      yourBid: 'Tu puja',
      placeBid: 'Pujar',
      bidNow: 'Pujar ahora',
      buyNow: 'Comprar ahora',
      timeLeft: 'Tiempo restante',
      endsIn: 'Termina en',
      ended: 'Terminada',
      winner: 'Ganador',
      noBids: 'Sin pujas',
      bidHistory: 'Historial de pujas',
      days: 'días',
      hours: 'horas',
      minutes: 'minutos',
      seconds: 'segundos',
    },
    // Cart & Checkout
    cart: {
      title: 'Carrito de Compras',
      empty: 'Tu carrito está vacío',
      emptyMessage: 'Agrega productos para comenzar',
      continueShopping: 'Seguir comprando',
      subtotal: 'Subtotal',
      shipping: 'Envío',
      tax: 'IVA',
      total: 'Total',
      checkout: 'Proceder al pago',
      quantity: 'Cantidad',
      remove: 'Eliminar',
      updateCart: 'Actualizar carrito',
    },
    checkout: {
      title: 'Checkout',
      contactInfo: 'Información de contacto',
      shippingAddress: 'Dirección de envío',
      billingAddress: 'Dirección de facturación',
      paymentMethod: 'Método de pago',
      placeOrder: 'Realizar pedido',
      orderSummary: 'Resumen del pedido',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      fullName: 'Nombre completo',
      address: 'Dirección',
      city: 'Ciudad',
      state: 'Estado',
      postalCode: 'Código postal',
      country: 'País',
      sameAsBilling: 'Usar como dirección de facturación',
      needInvoice: 'Requiero factura',
      rfc: 'RFC',
    },
    // Auth
    auth: {
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      resetPassword: 'Restablecer contraseña',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      createAccount: 'Crear cuenta',
      fullName: 'Nombre completo',
    },
    // Footer
    footer: {
      aboutUs: 'Sobre Nosotros',
      company: 'Empresa',
      legal: 'Legal',
      support: 'Soporte',
      followUs: 'Síguenos',
      terms: 'Términos y Condiciones',
      privacy: 'Política de Privacidad',
      paymentPolicies: 'Políticas de Pago',
      rights: 'Todos los derechos reservados',
      madeWith: 'Hecho con',
      in: 'en',
    },
    // Account
    account: {
      myAccount: 'Mi Cuenta',
      profile: 'Perfil',
      orders: 'Mis Pedidos',
      purchases: 'Mis Compras',
      publications: 'Mis Publicaciones',
      offers: 'Mis Ofertas',
      chats: 'Mensajes',
      settings: 'Configuración',
      becomeSeller: 'Quiero Vender',
    },
    // Filters
    filters: {
      category: 'Categoría',
      brand: 'Marca',
      price: 'Precio',
      priceRange: 'Rango de precio',
      minPrice: 'Precio mínimo',
      maxPrice: 'Precio máximo',
      condition: 'Condición',
      new: 'Nuevo',
      used: 'Usado',
      refurbished: 'Reacondicionado',
      availability: 'Disponibilidad',
      inStock: 'En existencia',
      onSale: 'En oferta',
      clearFilters: 'Limpiar filtros',
      applyFilters: 'Aplicar filtros',
    },
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      catalog: 'Catalog',
      brands: 'Brands',
      auctions: 'Auctions',
      marketplace: 'Marketplace',
      howToBuy: 'How to Buy',
      howToSell: 'How to Sell',
      about: 'About Us',
      contact: 'Contact',
      blog: 'Blog',
      faq: 'FAQ',
      support: 'Support',
      cart: 'Cart',
      myAccount: 'My Account',
      login: 'Sign In',
      logout: 'Sign Out',
      admin: 'Admin',
    },
    // Common
    common: {
      search: 'Search',
      searchPlaceholder: 'Search products, brands...',
      viewMore: 'View more',
      viewAll: 'View all',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      and: 'and',
      all: 'All',
      none: 'None',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      filters: 'Filters',
      sortBy: 'Sort by',
      priceAsc: 'Price: Low to High',
      priceDesc: 'Price: High to Low',
      newest: 'Newest',
      requestQuote: 'Request Quote',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      contactUs: 'Contact Us',
      language: 'Language',
      currency: 'Currency',
    },
    // Home page
    home: {
      hero: {
        title: 'Quality Industrial Machinery',
        subtitle: 'Buy, sell and auction industrial equipment with confidence',
        cta: 'Explore Catalog',
        ctaSecondary: 'Sell my Equipment',
      },
      featured: 'Featured Products',
      categories: 'Categories',
      recentProducts: 'Recently Added',
      partners: 'Partner Brands',
      stats: {
        products: 'Products',
        brands: 'Brands',
        customers: 'Customers',
        years: 'Years of experience',
      },
    },
    // Product
    product: {
      description: 'Description',
      specifications: 'Specifications',
      brand: 'Brand',
      model: 'Model',
      year: 'Year',
      condition: 'Condition',
      location: 'Location',
      stock: 'Available',
      sku: 'SKU',
      price: 'Price',
      originalPrice: 'Original price',
      discount: 'Discount',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      shipping: 'Shipping',
      freeShipping: 'Free Shipping',
      warranty: 'Warranty',
      questions: 'Questions',
      askQuestion: 'Ask a question',
      makeOffer: 'Make an offer',
      similarProducts: 'Similar Products',
      recentlyViewed: 'Recently Viewed',
    },
    // Auction
    auction: {
      currentBid: 'Current Bid',
      startingBid: 'Starting Bid',
      minimumBid: 'Minimum Bid',
      yourBid: 'Your Bid',
      placeBid: 'Place Bid',
      bidNow: 'Bid Now',
      buyNow: 'Buy Now',
      timeLeft: 'Time Left',
      endsIn: 'Ends in',
      ended: 'Ended',
      winner: 'Winner',
      noBids: 'No bids',
      bidHistory: 'Bid History',
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
      seconds: 'seconds',
    },
    // Cart & Checkout
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      emptyMessage: 'Add products to get started',
      continueShopping: 'Continue Shopping',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      total: 'Total',
      checkout: 'Proceed to Checkout',
      quantity: 'Quantity',
      remove: 'Remove',
      updateCart: 'Update Cart',
    },
    checkout: {
      title: 'Checkout',
      contactInfo: 'Contact Information',
      shippingAddress: 'Shipping Address',
      billingAddress: 'Billing Address',
      paymentMethod: 'Payment Method',
      placeOrder: 'Place Order',
      orderSummary: 'Order Summary',
      email: 'Email',
      phone: 'Phone',
      fullName: 'Full Name',
      address: 'Address',
      city: 'City',
      state: 'State',
      postalCode: 'Postal Code',
      country: 'Country',
      sameAsBilling: 'Same as billing address',
      needInvoice: 'I need an invoice',
      rfc: 'Tax ID',
    },
    // Auth
    auth: {
      login: 'Sign In',
      register: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot your password?',
      resetPassword: 'Reset Password',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      createAccount: 'Create Account',
      fullName: 'Full Name',
    },
    // Footer
    footer: {
      aboutUs: 'About Us',
      company: 'Company',
      legal: 'Legal',
      support: 'Support',
      followUs: 'Follow Us',
      terms: 'Terms & Conditions',
      privacy: 'Privacy Policy',
      paymentPolicies: 'Payment Policies',
      rights: 'All rights reserved',
      madeWith: 'Made with',
      in: 'in',
    },
    // Account
    account: {
      myAccount: 'My Account',
      profile: 'Profile',
      orders: 'My Orders',
      purchases: 'My Purchases',
      publications: 'My Listings',
      offers: 'My Offers',
      chats: 'Messages',
      settings: 'Settings',
      becomeSeller: 'Become a Seller',
    },
    // Filters
    filters: {
      category: 'Category',
      brand: 'Brand',
      price: 'Price',
      priceRange: 'Price Range',
      minPrice: 'Min Price',
      maxPrice: 'Max Price',
      condition: 'Condition',
      new: 'New',
      used: 'Used',
      refurbished: 'Refurbished',
      availability: 'Availability',
      inStock: 'In Stock',
      onSale: 'On Sale',
      clearFilters: 'Clear Filters',
      applyFilters: 'Apply Filters',
    },
  },
};
