import React, { useRef } from 'react';
import { ShoppingBag, Sparkles, PlusCircle, Search, SlidersHorizontal, Settings, Lock, Cloud, DollarSign } from 'lucide-react';
import { isCloudConfigured } from '../lib/supabase';

export function Header({
  storeConfig,
  cartCount,
  onOpenCart,
  onOpenUploader,
  onOpenSettings,
  onOpenPriceManager,
  searchQuery,
  setSearchQuery,
  totalProductsCount,
  isSellerMode,
  onOpenLoginModal,
  onLogoutSeller,
  onShareStore
}) {
  const hasCloud = isCloudConfigured(storeConfig);
  const logoTapRef = useRef({ count: 0, timer: null });

  // Gesto secreto: 5 toques al logo en menos de 2 segundos abre el login maestro
  const handleLogoClick = () => {
    logoTapRef.current.count += 1;
    if (logoTapRef.current.timer) clearTimeout(logoTapRef.current.timer);

    if (logoTapRef.current.count >= 5) {
      logoTapRef.current.count = 0;
      onOpenLoginModal();
    } else {
      logoTapRef.current.timer = setTimeout(() => {
        logoTapRef.current.count = 0;
      }, 2000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Store Branding (con gesto secreto) */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleLogoClick}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <span className="text-xl sm:text-2xl">👟</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  {storeConfig.storeName || "Calzados Express"}
                </h1>
                {hasCloud ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    Nube Activa
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
                    PWA Activa
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {storeConfig.tagline || "Venta de calzado con pedidos a WhatsApp"}
              </p>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar por modelo, estilo o color..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Si es vendedor autenticado */}
            {isSellerMode ? (
              <>
                {/* Badge Vendedor */}
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  ⚡ Modo Admin
                </span>

                {/* Quick Upload Button (Direct gallery & AI) */}
                <button
                  onClick={onOpenUploader}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
                  title="Vincular fotos de la galería del dispositivo"
                >
                  <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
                  <span className="font-bold">Subir Fotos IA</span>
                </button>

                {/* Quick Price Manager Button */}
                <button
                  onClick={onOpenPriceManager}
                  className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs sm:text-sm font-bold transition-all active:scale-95"
                  title="Gestor rápido de precios y ofertas masivas"
                >
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Precios</span>
                </button>

                {/* Store Config / Settings */}
                <button
                  onClick={onOpenSettings}
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/80 active:scale-95"
                  title="Configurar WhatsApp y Tienda"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* Botón Cerrar Sesión / Bloquear */}
                <button
                  onClick={onLogoutSeller}
                  className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all active:scale-95"
                  title="Bloquear y salir del modo administrador"
                >
                  <Lock className="w-5 h-5" />
                </button>
              </>
            ) : (
              /* Vista Cliente 100% Limpia (sin candado ni accesos visibles) */
              <>
                {/* Botón Compartir Tienda */}
                <button
                  onClick={onShareStore}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 active:scale-95"
                  title="Copiar enlace de la tienda"
                >
                  <span>🔗 Compartir</span>
                </button>
              </>
            )}

            {/* Shopping Bag Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700/80 active:scale-95"
              title="Ver carrito de pedidos"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar zapatos por marca, color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
