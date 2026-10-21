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
    material: "Malla transpirable y suela EVA ultraligera de alta densidad",
    description: "🔥 Estilo urbano imponente y amortiguación reactiva de alto impacto. Desarrolladas con tejido transpirable que mantiene tus pies frescos y suela de alta absorción que elimina el cansancio en caminatas largas o entrenamientos. El calzado versátil indispensable para elevar cualquier outfit casual. ✨ ¡Pocas unidades disponibles!",
    featured: true,
    seasonBadge: "🔥 Tendencia 2027",
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
    material: "100% Cuero genuino vacuno con elásticos laterales reforzados",
    description: "🍂 Máxima sofisticación y presencia en cada pisada. Confeccionados en 100% cuero vacuno seleccionado con elásticos laterales reforzados y suela antideslizante todoterreno. El botín clásico definitivo para lucir elegante, estilizada y abrigada en cualquier ocasión. ✨ ¡Edición exclusiva de temporada!",
    featured: true,
    seasonBadge: "🍂 Colección 2027",
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
    material: "Cuero lustrado premium con costuras milimétricas de precisión",
    description: "👔 Porte ejecutivo, distinción y acabado de alta gama. Elaborados en cuero lustrado con costuras milimétricas y plantilla anatómica acolchada para largas jornadas laborales o eventos sin fatiga. La elección definitiva de quien proyecta éxito y elegancia. ✨ ¡Envío prioritario por WhatsApp!",
    featured: false,
    seasonBadge: "👔 Colección Ejecutiva 2027",
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
    description: "⚡ Inspiración retro basket con estética urbana legendaria. Caña alta con soporte reforzado para el tobillo y suela de caucho vulcanizado de máxima resistencia. Un modelo icónico que destaca donde sea que vayas. ✨ ¡Stock limitado para coleccionistas de estilo!",
    featured: true,
    seasonBadge: "⚡ Edición Limitada 2027",
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
    description: "☀️ Frescura radiante, confort absoluto y altura estilizada. Plataforma ultra ligera en yute artesanal con plantilla acolchada que garantiza pisadas suaves durante todo el día. Ideales para vacaciones, fines de semana soleados y outfits veraniegos. ✨ ¡Pide tu talla ahora!",
    featured: false,
    seasonBadge: "☀️ Temporada Verano 2027",
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
    description: "✨ El básico premium imprescindible que combina con absolutamente todo. Acabado blanco pulcro de fácil limpieza, plantilla ergonómica de descanso y ligereza inigualable. El tenis que nunca pasa de moda para lucir impecable los 7 días de la semana. ✨ ¡Lo más vendido!",
    featured: true,
    seasonBadge: "✨ Lo Más Vendido 2027",
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
