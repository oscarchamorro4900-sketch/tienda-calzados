import React from 'react';
import { Flame, MessageCircle, Truck, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export function HeroBanner({
  onExploreTrending,
  onOpenUploader,
  storeConfig,
  isSellerMode,
  onContactWhatsApp
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 p-6 sm:p-10 shadow-2xl border border-slate-700/50">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Copy & CTAs */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold tracking-wide">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>Colección de Temporada 2027</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Encuentra tu calzado ideal, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">tus zapatos al instante.</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Explora las mejores marcas y estilos en calzado urbano, deportivo y formal. 
            Haz tu pedido en segundos directamente al <strong>WhatsApp del vendedor</strong> con talla y especificaciones listas.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onExploreTrending}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Ver Más Vendidos</span>
            </button>

            {isSellerMode ? (
              <button
                onClick={onOpenUploader}
                className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-sm border border-slate-600 flex items-center gap-2 transition-all active:scale-95 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Subir Fotos con IA</span>
              </button>
            ) : (
              <button
                onClick={onContactWhatsApp}
                className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-sm border border-slate-600 flex items-center gap-2 transition-all active:scale-95 backdrop-blur-sm"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Consultar por WhatsApp</span>
              </button>
            )}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Atención directa WhatsApp</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Truck className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-medium">Envíos coordinados rápidos</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-medium">Garantía en cada par</span>
            </div>
          </div>

        </div>

        {/* Right Column: Visual Showcase Card */}
        <div className="lg:col-span-5 hidden sm:block">
          <div className="relative group">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-800/50">
              <img
                src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=500&q=75"
                alt="Sneakers destacados"
                className="w-full h-64 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Edición Especial</span>
                  <h4 className="text-sm font-bold text-white">Retro High Top Basket Vintage</h4>
                  <p className="text-xs text-slate-400">Tallas disponibles: 38 - 44</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 line-through">$189.000</span>
                  <div className="text-lg font-black text-emerald-400">$149.000</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
