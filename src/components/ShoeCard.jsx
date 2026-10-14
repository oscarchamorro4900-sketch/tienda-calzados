import React from 'react';
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

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onViewDetails(shoe)}>
        <img
          src={primaryImage}
          alt={shoe.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {shoe.seasonBadge && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-900/85 backdrop-blur-md text-white shadow-sm">
              {shoe.seasonBadge}
            </span>
          )}
          {shoe.discount && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-sm">
              {shoe.discount}
            </span>
          )}
        </div>

        {/* Botón Maestro de Configuración si es Administrador */}
        {isSellerMode ? (
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditShoe(shoe);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition-all border border-amber-500/40"
              title="Configurar precio, fotos, descripción y tallas"
            >
              <Edit3 className="w-3.5 h-3.5 fill-current" />
              <span>Configurar</span>
            </button>
          </div>
        ) : (
          /* AI Analyzed Tag para clientes */
          shoe.isAiAnalyzed && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/90 text-white shadow-sm backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Detectado IA</span>
              </span>
            </div>
          )
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(shoe);
            }}
            className="px-4 py-2 rounded-xl bg-white/95 text-slate-900 font-bold text-xs shadow-lg backdrop-blur-sm flex items-center gap-1.5 hover:bg-white transform translate-y-2 group-hover:translate-y-0 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-slate-700" />
            <span>Vista Rápida</span>
          </button>
        </div>
      </div>

      {/* Body Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-emerald-700">
              {shoe.brand || "Exclusivo"} • {shoe.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{shoe.rating || "4.9"}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(shoe)}
            className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1 cursor-pointer hover:text-emerald-600 transition-colors"
            title={shoe.name}
          >
            {shoe.name}
          </h3>

          {/* Available Sizes preview */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <span className="text-[10px] text-slate-400 font-semibold mr-1">Tallas:</span>
            {shoe.sizes?.slice(0, 5).map((size) => (
              <span
                key={size}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
              >
                {size}
              </span>
            ))}
            {shoe.sizes?.length > 5 && (
              <span className="text-[10px] font-bold text-slate-400">+{shoe.sizes.length - 5}</span>
            )}
          </div>
        </div>

        {/* Price & Primary WhatsApp Actions */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {formatPrice(shoe.price, currency)}
              </span>
              {shoe.originalPrice && (
                <span className="ml-2 text-xs text-slate-400 line-through">
                  {formatPrice(shoe.originalPrice, currency)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              Disponible
            </span>
          </div>

          {/* Botón Maestro de Configuración Completa si está en Modo Vendedor */}
          {isSellerMode && (
            <button
              onClick={() => onEditShoe(shoe)}
              className="w-full mb-3 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
              <span>Configurar todo (Precio, Fotos, etc.)</span>
            </button>
          )}

          {/* Action Buttons: 1-Click WhatsApp Order + Add to Cart */}
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => onDirectWhatsApp(shoe)}
              className="col-span-4 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              title="Pedir directamente a WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" />
              <span>Pedir por WhatsApp</span>
            </button>

            <button
              onClick={() => onAddToCart(shoe)}
              className="col-span-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center border border-slate-200 active:scale-95 transition-all"
              title="Añadir al carrito para pedido múltiple"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
