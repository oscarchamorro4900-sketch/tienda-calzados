// Catálogo inicial con calzados de temporada listos para exhibir y vender
export const INITIAL_SHOES = [
  {
    id: "SHOE-101",
    name: "Sneakers Urban Street Runner",
    category: "Deportivo",
    gender: "Unisex",
    brand: "AeroStep",
    price: 129000,
    originalPrice: 169000,
    discount: "24% OFF",
    rating: 4.9,
    reviewsCount: 34,
    sizes: [38, 39, 40, 41, 42, 43],
    colors: ["Blanco", "Negro", "Gris"],
    material: "Malla transpirable y suela EVA ultraligera",
    description: "Zapatillas deportivas urbanas de última tendencia. Suela amortiguada de alta absorción de impacto y tejido transpirable ideal para caminar o entrenar con máximo confort.",
    featured: true,
    seasonBadge: "🔥 Tendencia 2026",
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "SHOE-102",
    name: "Botines de Cuero Chelsea Elegance",
    category: "Botas",
    gender: "Mujer",
    brand: "Vanguard Leather",
    price: 169000,
    originalPrice: 219000,
    discount: "23% OFF",
    rating: 4.8,
    reviewsCount: 22,
    sizes: [36, 37, 38, 39],
    colors: ["Negro", "Café Chocolate"],
    material: "100% Cuero genuino vacuno con elásticos laterales",
    description: "Botines Chelsea clásicos y versátiles para cualquier outfit de otoño/invierno. Acabado fino, tacón cómodo de 4cm y suela antideslizante reforzada.",
    featured: true,
    seasonBadge: "🍂 Temporada Otoño/Invierno",
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "SHOE-103",
    name: "Zapatos Formales Oxford Clásicos",
    category: "Formal",
    gender: "Hombre",
    brand: "Milano Sartoriale",
    price: 189000,
    originalPrice: 239000,
    discount: "21% OFF",
    rating: 5.0,
    reviewsCount: 18,
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ["Marrón Tostado", "Negro Charol"],
    material: "Cuero lustrado premium con costuras de precisión",
    description: "Zapato de vestir estilo Oxford con puntera picada. El calzado imprescindible para eventos formales, oficina o reuniones importantes. Máxima distinción.",
    featured: false,
    seasonBadge: "⭐ Más Vendido",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "SHOE-104",
    name: "Retro High Top Basket Vintage",
    category: "Deportivo",
    gender: "Unisex",
    brand: "Court King",
    price: 149000,
    originalPrice: 189000,
    discount: "21% OFF",
    rating: 4.9,
    reviewsCount: 45,
    sizes: [37, 38, 39, 40, 41, 42, 43, 44],
    colors: ["Blanco/Azul", "Rojo/Negro"],
    material: "Cuero sintético de alta resistencia y suela de caucho vulcanizado",
    description: "Sneakers de bota alta inspirados en el baloncesto de los 80s y 90s. Gran soporte para el tobillo y estética urbana que no pasa desapercibida.",
    featured: true,
    seasonBadge: "⚡ Edición Limitada",
    stock: 6,
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "SHOE-105",
    name: "Sandalias de Plataforma Summer Glow",
    category: "Sandalias",
    gender: "Mujer",
    brand: "Sol & Brisa",
    price: 89000,
    originalPrice: 119000,
    discount: "25% OFF",
    rating: 4.7,
    reviewsCount: 29,
    sizes: [35, 36, 37, 38, 39],
    colors: ["Beige Arena", "Dorado"],
    material: "Yute natural trenzado y tiras suaves ecológicas",
    description: "Sandalias ligeras de verano con cuña de plataforma de corcho/yute. Plantilla acolchada para caminar todo el día en la playa o la ciudad sin cansancio.",
    featured: false,
    seasonBadge: "☀️ Verano",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "SHOE-106",
    name: "Sneakers Minimalistas White Cloud",
    category: "Casual",
    gender: "Unisex",
    brand: "Nordic Step",
    price: 119000,
    originalPrice: 155000,
    discount: "23% OFF",
    rating: 4.8,
    reviewsCount: 50,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43],
    colors: ["Blanco Puro"],
    material: "Cuero sintético ecológico hidrófugo y suela ergonómica",
    description: "Los tenis blancos esenciales que combinan con jeans, shorts, vestidos o pantalones de vestir. Limpieza fácil e interior súper suave.",
    featured: true,
    seasonBadge: "✨ Básico Imprescindible",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

export const CATEGORIES = [
  "Todos",
  "Deportivo",
  "Casual",
  "Formal",
  "Botas",
  "Sandalias"
];

export const GENDERS = [
  "Todos",
  "Hombre",
  "Mujer",
  "Unisex"
];

export const SIZES = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
