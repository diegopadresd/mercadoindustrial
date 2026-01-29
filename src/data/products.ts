export interface Product {
  id: string;
  title: string;
  sku: string;
  brand: string;
  price?: number;
  stock?: number;
  location: string;
  branch?: string;
  image: string;
  images: string[];
  categories: string[];
  tags?: string[];
  description?: string;
  specs?: Record<string, string>;
  youtubeUrl?: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export const products: Product[] = [
  {
    id: 'VEHI-024-NAV',
    title: 'Plataforma telescópica año 2007 modelo S125 marca GENIE',
    sku: 'VEHI-024-NAV',
    brand: 'GENIE',
    stock: 1,
    location: 'Virtual',
    branch: 'Virtual',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-024-NAV_PCV_7_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-024-NAV_PCV_7_med_thumb.webp',
    ],
    categories: ['Plataforma Telescópica'],
    tags: ['PLATAFORMA', 'GENIE', 'S125', 'TELESCÓPICA', '2007'],
    description: `Plataforma telescópica año 2007 modelo S125 marca GENIE
    
    Descripción general:
    • Marca: GENIE
    • Modelo: S125
    • Año: 2007
    • Tipo: Plataforma telescópica
    • Ubicación: Virtual
    `,
    isFeatured: true,
  },
  {
    id: 'PMN-2901',
    title: 'Arandela de seguridad 3" parte 690 marca FLOWSERVE',
    sku: 'PMN-2901',
    brand: 'FLOWSERVE',
    stock: 1,
    location: 'Hermosillo, Sonora, México',
    branch: 'Hermosillo',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2901_Refacciones_2_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2901_Refacciones_2_med_thumb.webp',
    ],
    categories: ['Refacciones'],
    tags: ['ARANDELA', 'FLOWSERVE', 'REFACCION', 'SEGURIDAD'],
    description: `Arandela de seguridad 3" parte 690 marca FLOWSERVE
    
    Descripción general:
    • Marca: FLOWSERVE
    • Parte: 690
    • Tamaño: 3"
    • Tipo: Arandela de seguridad
    `,
  },
  {
    id: 'PMN-2900',
    title: 'Deflector 1 7/8" parte 241-1 marca FLOWSERVE',
    sku: 'PMN-2900',
    brand: 'FLOWSERVE',
    stock: 1,
    location: 'Hermosillo, Sonora, México',
    branch: 'Hermosillo',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2900_Refacciones_1_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2900_Refacciones_1_med_thumb.webp',
    ],
    categories: ['Refacciones'],
    tags: ['DEFLECTOR', 'FLOWSERVE', 'REFACCION'],
    description: `Deflector 1 7/8" parte 241-1 marca FLOWSERVE
    
    Descripción general:
    • Marca: FLOWSERVE
    • Parte: 241-1
    • Tamaño: 1 7/8"
    • Tipo: Deflector
    `,
  },
  {
    id: 'PMN-2899',
    title: 'Anillo de desgaste 7 1/8" parte 207 marca FLOWSERVE',
    sku: 'PMN-2899',
    brand: 'FLOWSERVE',
    stock: 1,
    location: 'Hermosillo, Sonora, México',
    branch: 'Hermosillo',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2899_Refacciones_1_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2899_Refacciones_1_med_thumb.webp',
    ],
    categories: ['Refacciones'],
    tags: ['ANILLO', 'FLOWSERVE', 'REFACCION', 'DESGASTE'],
    description: `Anillo de desgaste 7 1/8" parte 207 marca FLOWSERVE
    
    Descripción general:
    • Marca: FLOWSERVE
    • Parte: 207
    • Tamaño: 7 1/8"
    • Tipo: Anillo de desgaste
    `,
  },
  {
    id: 'VEHI-023-NAV',
    title: 'Excavadora sobre orugas año 2011 modelo D6N XL marca CATERPILLAR',
    sku: 'VEHI-023-NAV',
    brand: 'CATERPILLAR',
    stock: 1,
    location: 'Virtual',
    branch: 'Virtual',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-023-NAV_3_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-023-NAV_3_med_thumb.webp',
    ],
    categories: ['Bulldozer', 'Maquinaria pesada'],
    tags: ['CATERPILLAR', 'EXCAVADORA', 'D6N', 'ORUGAS', 'BULLDOZER'],
    description: `Excavadora sobre orugas año 2011 modelo D6N XL marca CATERPILLAR
    
    Descripción general:
    • Marca: CATERPILLAR
    • Modelo: D6N XL
    • Año: 2011
    • Tipo: Excavadora sobre orugas
    `,
    isFeatured: true,
  },
  {
    id: 'VEHI-022-NAV',
    title: 'Plataforma telescópica año 2007 modelo E450AJ marca JLG LIFT',
    sku: 'VEHI-022-NAV',
    brand: 'JLG',
    stock: 1,
    location: 'Virtual',
    branch: 'Virtual',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-022-NAV_3_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-022-NAV_3_med_thumb.webp',
    ],
    categories: ['Plataforma Telescópica'],
    tags: ['JLG', 'PLATAFORMA', 'E450AJ', 'TELESCÓPICA'],
    description: `Plataforma telescópica año 2007 modelo E450AJ marca JLG LIFT
    
    Descripción general:
    • Marca: JLG LIFT
    • Modelo: E450AJ
    • Año: 2007
    • Tipo: Plataforma telescópica
    `,
    isFeatured: true,
  },
  {
    id: 'VEHI-021-NAV',
    title: 'Góndola de 24m3 año 2016 marca ATROS',
    sku: 'VEHI-021-NAV',
    brand: 'ATROS',
    stock: 1,
    location: 'Virtual',
    branch: 'Virtual',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-021-NAV_6_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-021-NAV_6_med_thumb.webp',
    ],
    categories: ['Vehículos'],
    tags: ['ATROS', 'GÓNDOLA', 'VEHÍCULO', '24M3'],
    description: `Góndola de 24m3 año 2016 marca ATROS
    
    Descripción general:
    • Marca: ATROS
    • Capacidad: 24m3
    • Año: 2016
    • Tipo: Góndola
    `,
    isFeatured: true,
  },
  {
    id: 'VEHI-020-NAV',
    title: 'Compactador neumático año 1987 marca FERGUSON',
    sku: 'VEHI-020-NAV',
    brand: 'FERGUSON',
    stock: 1,
    location: 'Virtual',
    branch: 'Virtual',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-020-NAV_PCV_5_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-020-NAV_PCV_5_med_thumb.webp',
    ],
    categories: ['Compactador', 'Maquinaria pesada'],
    tags: ['FERGUSON', 'COMPACTADOR', 'NEUMÁTICO'],
    description: `Compactador neumático año 1987 marca FERGUSON
    
    Descripción general:
    • Marca: FERGUSON
    • Año: 1987
    • Tipo: Compactador neumático
    `,
    isFeatured: true,
  },
  {
    id: 'VEHI-019-NAV',
    title: 'Compactador neumático año 2008 modelo CP142 marca DYNAPAC',
    sku: 'VEHI-019-NAV',
    brand: 'DYNAPAC',
    stock: 1,
    location: 'Virtual',
    branch: 'Virtual',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-019-NAV_1_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-019-NAV_1_med_thumb.webp',
    ],
    categories: ['Compactador', 'Maquinaria pesada'],
    tags: ['DYNAPAC', 'COMPACTADOR', 'CP142', 'NEUMÁTICO'],
    description: `Compactador neumático año 2008 modelo CP142 marca DYNAPAC
    
    Descripción general:
    • Marca: DYNAPAC
    • Modelo: CP142
    • Año: 2008
    • Tipo: Compactador neumático
    `,
    isFeatured: true,
  },
  {
    id: 'VEHI-018-NAV',
    title: 'Excavadora sobre orugas año 1986 modelo D6H marca CATERPILLAR',
    sku: 'VEHI-018-NAV',
    brand: 'CATERPILLAR',
    stock: 1,
    location: 'Virtual',
    branch: 'Virtual',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-018-NAV_21_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-018-NAV_21_med_thumb.webp',
    ],
    categories: ['Bulldozer', 'Maquinaria pesada'],
    tags: ['CATERPILLAR', 'EXCAVADORA', 'D6H', 'ORUGAS', 'BULLDOZER'],
    description: `Excavadora sobre orugas año 1986 modelo D6H marca CATERPILLAR
    
    Descripción general:
    • Marca: CATERPILLAR
    • Modelo: D6H
    • Año: 1986
    • Tipo: Excavadora sobre orugas
    `,
    isFeatured: true,
  },
  {
    id: 'VEHI-017-NAV',
    title: 'Retroexcavadora año 2001 modelo 416D marca CATERPILLAR',
    sku: 'VEHI-017-NAV',
    brand: 'CATERPILLAR',
    stock: 1,
    location: 'Virtual',
    branch: 'Virtual',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-017-NAV_4_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-017-NAV_4_med_thumb.webp',
    ],
    categories: ['Maquinaria pesada'],
    tags: ['CATERPILLAR', 'RETROEXCAVADORA', '416D'],
    description: `Retroexcavadora año 2001 modelo 416D marca CATERPILLAR
    
    Descripción general:
    • Marca: CATERPILLAR
    • Modelo: 416D
    • Año: 2001
    • Tipo: Retroexcavadora
    `,
    isFeatured: true,
  },
  {
    id: 'VEHI-016-NAV',
    title: 'Compactador año 1993 modelo SD40 marca INGERSOLL-RAND',
    sku: 'VEHI-016-NAV',
    brand: 'INGERSOLL-RAND',
    stock: 1,
    location: 'Virtual',
    branch: 'Virtual',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-016-NAV_1_med_thumb.webp',
    images: [
      'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-016-NAV_1_med_thumb.webp',
    ],
    categories: ['Compactador', 'Maquinaria pesada'],
    tags: ['INGERSOLL-RAND', 'COMPACTADOR', 'SD40'],
    description: `Compactador año 1993 modelo SD40 marca INGERSOLL-RAND
    
    Descripción general:
    • Marca: INGERSOLL-RAND
    • Modelo: SD40
    • Año: 1993
    • Tipo: Compactador
    `,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id || p.sku === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(p => 
    p.categories.some(c => c.toLowerCase().includes(category.toLowerCase()))
  );
};

export const getProductsByBrand = (brand: string): Product[] => {
  return products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
};

// Extract unique brands from products
export const brands = [...new Set(products.map(p => p.brand))];

// Extract unique categories from products
export const allCategories = [...new Set(products.flatMap(p => p.categories))];
