import React, { useState, useMemo } from 'react';
import { MessageCircle, ShoppingBag, Eye, Star, Sparkles, Edit3 } from 'lucide-react';
import { formatPrice } from '../utils/formatCurrency';

export function ShoeCard({
  shoe,
  storeConfig,
  onViewDetails,
  onAddToCart,
  onDirectWhatsApp,
  isSellerMode,
  onEditShoe
}) {
  const currency = storeConfig.currency || "$";
  const primaryImage = shoe.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

  // Tallas disponibles reales en este calzado
  const availableSizes = useMemo(() => {
    if (Array.isArray(shoe.sizes) && shoe.sizes.length > 0) {
      return shoe.sizes.map(Number);
    }
    return [38, 39, 40, 41, 42, 43];
  }, [shoe.sizes]);

  // Cuadrícula de 6 tallas estilo tienda QUEST (3 columnas x 2 filas)
  const displaySizes = useMemo(() => {
    const isWomen = shoe.gender === "Mujer";
    const minS = Math.min(...availableSizes);
    const maxS = Math.max(...availableSizes);

    if (minS >= 37 && maxS <= 44) {
      return [38, 39, 40, 41, 42, 43];
    }
    if (minS >= 34 && maxS <= 40) {
      return [35, 36, 37, 38, 39, 40];
    }
    return availableSizes.slice(0, 6);
  }, [availableSizes, shoe.gender]);

  // Talla seleccionada actual (inicia con la primera disponible)
  const [selectedSize, setSelectedSize] = useState(() => {
    return availableSizes[0] || displaySizes[0] || 39;
  });

  // Texto del descuento (ej: 20% o 24%)
  const discountText = useMemo(() => {
    if (shoe.discount) {
      return shoe.discount.replace(" OFF", "").trim();
    }
    if (shoe.originalPrice && Number(shoe.originalPrice) > Number(shoe.price)) {
      const pct = Math.round(((shoe.originalPrice - shoe.price) / shoe.originalPrice) * 100);
      return `${pct}%`;
    }
    return null;
  }, [shoe.discount, shoe.originalPrice, shoe.price]);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      
      {/* Contenedor Superior de Imagen (Aspect Square) */}
      <div 
        className="relative aspect-square overflow-hidden bg-slate-50 cursor-pointer"
        onClick={() => onViewDetails(shoe)}
      >
        <img
          src={primaryImage}
          alt={shoe.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badge de Descuento Rojo en esquina superior izquierda */}
        {discountText && (
          <div className="absolute top-0 left-0 bg-red-600 text-white font-extrabold text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 tracking-tight rounded-br-lg shadow-sm z-10">
            {discountText}
          </div>
        )}

        {/* Botón Maestro de Configuración si es Administrador */}
        {isSellerMode ? (
          <div className="absolute top-2 right-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditShoe(shoe);
              }}
              className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] sm:text-xs shadow-md flex items-center gap-1 active:scale-95 transition-all border border-amber-500/50"
              title="Configurar producto"
            >
              <Edit3 className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">Configurar</span>
            </button>
          </div>
        ) : (
          shoe.isAiAnalyzed && (
            <div className="absolute top-2 right-2 z-10">
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/90 text-white shadow-sm backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span className="hidden sm:inline">IA</span>
              </span>
            </div>
          )
        )}

        {/* Botón Flotante Circular Negro para Agregar al Carrito (Igual a la foto QUEST) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(shoe, selectedSize);
          }}
          className="absolute bottom-2.5 right-2.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-lg active:scale-90 transition-all z-10"
          title={`Añadir al carrito con Talla ${selectedSize}`}
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
      </div>

      {/* Contenido / Información del Calzado */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Título del Producto */}
          <h3
            onClick={() => onViewDetails(shoe)}
            className="font-semibold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-snug cursor-pointer hover:text-emerald-600 transition-colors min-h-[2rem]"
            title={shoe.name}
          >
            {shoe.name}
          </h3>

          {/* Precios (Oferta + Tachado) - Diseño Anti-Superposición */}
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 leading-tight">
            <span className="font-black text-sm sm:text-base text-rose-700 whitespace-nowrap tracking-tight">
              {formatPrice(shoe.price)}
            </span>
            {shoe.originalPrice && Number(shoe.originalPrice) > Number(shoe.price) && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through font-medium whitespace-nowrap">
                {formatPrice(shoe.originalPrice)}
              </span>
            )}
          </div>

          {/* Selector de Tallas en Cuadrícula (Directo en Pantalla Principal) */}
          <div className="mt-2.5 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
              {displaySizes.map((sz) => {
                const isAvailable = availableSizes.includes(sz);
                const isSelected = selectedSize === sz;

                return (
                  <button
                    key={sz}
                    type="button"
                    disabled={!isAvailable}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAvailable) setSelectedSize(sz);
                    }}
                    className={`h-7 sm:h-8 flex items-center justify-center text-[11px] sm:text-xs transition-all ${
                      isSelected
                        ? 'border-2 border-slate-950 font-black text-slate-950 bg-white shadow-xs'
                        : isAvailable
                          ? 'border border-slate-200 text-slate-700 font-medium hover:border-slate-400 bg-white active:scale-95'
                          : 'border border-slate-100 text-slate-300 font-normal bg-slate-50 cursor-not-allowed'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botón de Pedido Inmediato a WhatsApp con la Talla Elegida */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDirectWhatsApp(shoe, selectedSize);
            }}
            className="w-full py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title={`Pedir directamente por WhatsApp con Talla ${selectedSize}`}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
            <span className="truncate">Pedir Talla {selectedSize}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
