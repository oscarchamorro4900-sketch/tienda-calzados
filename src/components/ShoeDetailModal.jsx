import React, { useState } from 'react';
import { X, MessageCircle, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, Star, Sparkles, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatPrice } from '../utils/formatCurrency';

export function ShoeDetailModal({
  shoe,
  storeConfig,
  isOpen,
  onClose,
  onAddToCart,
  onDirectWhatsApp,
  isSellerMode,
  onEditShoe
}) {
  if (!isOpen || !shoe) return null;

  const currency = storeConfig.currency || "$";
  const [selectedSize, setSelectedSize] = useState(shoe.sizes?.[0] || 40);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const images = shoe.images && shoe.images.length > 0
    ? shoe.images
    : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"];

  const handleOrderWhatsApp = () => {
    // Confetti effect on order click
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {
      // ignore
    }

    onDirectWhatsApp(shoe, selectedSize);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      
      {/* Modal Container */}
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 transform transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Showcase */}
          <div className="p-4 sm:p-6 bg-slate-100 flex flex-col justify-between">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={shoe.name}
                className="w-full h-full object-cover object-center"
              />

              {shoe.seasonBadge && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black bg-slate-900/85 backdrop-blur-md text-white shadow-md">
                  {shoe.seasonBadge}
                </span>
              )}

              {shoe.discount && (
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md">
                  {shoe.discount}
                </span>
              )}
            </div>

            {/* Thumbnail list if multiple images exist */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx ? 'border-emerald-500 scale-105' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Guarantees */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200/80 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Envíos ágiles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Fotos reales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cambio de talla</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & WhatsApp Action */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Category, Brand, Rating */}
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider text-[11px]">
                  {shoe.brand || "Calzado"} • {shoe.category}
                </span>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{shoe.rating || "4.9"} ({shoe.reviewsCount || "30"} opiniones)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {shoe.name}
              </h2>

              {/* Pricing */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  {formatPrice(shoe.price, currency)}
                </span>
                {shoe.originalPrice && (
                  <span className="text-base text-slate-400 line-through">
                    {formatPrice(shoe.originalPrice, currency)}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  Stock disponible ({shoe.stock || 10} pares)
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {shoe.description}
              </p>

              {/* Shoe Technical Specs */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Material:</span>
                  <span className="text-slate-800 font-semibold">{shoe.material || "Material de alta resistencia"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Colores detectados:</span>
                  <span className="text-slate-800 font-semibold">{shoe.colors?.join(", ") || "Color estándar"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Género:</span>
                  <span className="text-slate-800 font-semibold">{shoe.gender || "Unisex"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Código / Referencia:</span>
                  <span className="text-slate-800 font-mono font-bold">{shoe.id}</span>
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Elige tu talla (EU/Nacional):
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    Talla seleccionada: {selectedSize}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {shoe.sizes?.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-10 h-10 px-3 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                        selectedSize === sz
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              
              {/* Botón Maestro si es Administrador */}
              {isSellerMode && (
                <button
                  onClick={() => {
                    onClose();
                    onEditShoe(shoe);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-amber-500/40 mb-2"
                >
                  <Edit3 className="w-4 h-4 fill-current" />
                  <span>Configurar este Calzado (Modo Maestro)</span>
                </button>
              )}

              {/* WhatsApp Checkout Button */}
              <button
                onClick={handleOrderWhatsApp}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                <span>Pedir Talla {selectedSize} por WhatsApp</span>
              </button>

              {/* Add to Cart */}
              <button
                onClick={() => {
                  onAddToCart(shoe, selectedSize);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-200 transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-slate-600" />
                <span>Añadir al Carrito de Pedidos</span>
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
