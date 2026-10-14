import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_SHOES } from './data/initialShoes';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { ShoeCard } from './components/ShoeCard';
import { ShoeDetailModal } from './components/ShoeDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminUploaderModal } from './components/AdminUploaderModal';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { EditShoeModal } from './components/EditShoeModal';
import { PriceManagerModal } from './components/PriceManagerModal';
import {
  isCloudConfigured,
  fetchShoesFromCloud,
  saveShoeToCloud,
  saveBatchShoesToCloud,
  deleteShoeFromCloud,
  subscribeToRealtimeShoes,
  mapRowToShoe
} from './lib/supabase';
import { Sparkles, MessageCircle, ShoppingBag, Plus, ArrowUp, Lock, ShieldCheck, Cloud } from 'lucide-react';
import { formatPrice } from './utils/formatCurrency';

const STORAGE_KEY_SHOES = 'calzados_catalog_v1';
const STORAGE_KEY_CART = 'calzados_cart_v1';
const STORAGE_KEY_CONFIG = 'calzados_config_v1';

export default function App() {
  // 1. Estado del Catálogo de Zapatos
  const [shoes, setShoes] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SHOES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Si los zapatos guardados tienen precios viejos en dólares (menores a 500), migrar a COP
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].price < 500) {
          return INITIAL_SHOES;
        }
        return parsed;
      } catch (e) {}
    }
    return INITIAL_SHOES;
  });

  // 2. Estado de Configuración de la Tienda
  const [storeConfig, setStoreConfig] = useState(() => {
    const defaultEnvConfig = {
      storeName: "Calzados Temporada",
      tagline: "Venta de calzado exclusivo con pedidos por WhatsApp",
      whatsappNumber: "573001234567", // Número de Colombia configurable
      currency: "COP $",
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
      adminPin: import.meta.env.VITE_ADMIN_PASSWORD || "CalzadosAdmin2026*",
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ""
    };

    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.adminPin || parsed.adminPin === "2026") {
          parsed.adminPin = defaultEnvConfig.adminPin;
        }
        parsed.currency = "COP $";
        if (parsed.whatsappNumber?.startsWith("521")) {
          parsed.whatsappNumber = "573001234567";
        }
        // Si no están en localStorage, rescatar desde variables de entorno
        if (!parsed.supabaseUrl && defaultEnvConfig.supabaseUrl) {
          parsed.supabaseUrl = defaultEnvConfig.supabaseUrl;
        }
        if (!parsed.supabaseAnonKey && defaultEnvConfig.supabaseAnonKey) {
          parsed.supabaseAnonKey = defaultEnvConfig.supabaseAnonKey;
        }
        if (!parsed.geminiApiKey && defaultEnvConfig.geminiApiKey) {
          parsed.geminiApiKey = defaultEnvConfig.geminiApiKey;
        }
        return parsed;
      } catch (e) {}
    }
    return defaultEnvConfig;
  });

  // 3. Estado del Carrito
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CART);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // 4. Estados de Filtrado y Búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedGender, setSelectedGender] = useState("Todos");
  const [selectedSize, setSelectedSize] = useState(null);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  // 5. Modo Administrador / Vendedor Protegido por PIN
  const [isSellerMode, setIsSellerMode] = useState(() => {
    // Solo activo si el dueño se autenticó en esta sesión con su PIN
    return sessionStorage.getItem('calzados_admin_auth') === 'true';
  });

  // 6. Estados de Modales
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [editingShoe, setEditingShoe] = useState(null);
  const [detailModalShoe, setDetailModalShoe] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPriceManagerOpen, setIsPriceManagerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Persistir estado de autenticación en la sesión actual
  useEffect(() => {
    sessionStorage.setItem('calzados_admin_auth', isSellerMode ? 'true' : 'false');
  }, [isSellerMode]);

  // Detección de ruta secreta /admin o #admin para acceso exclusivo del dueño
  useEffect(() => {
    const checkAdminPath = () => {
      const path = (window.location.pathname || "").toLowerCase();
      const hash = (window.location.hash || "").toLowerCase();
      if (path.includes("/admin") || path.includes("/maestro") || hash.includes("admin")) {
        if (!isSellerMode) {
          setIsLoginModalOpen(true);
        }
      }
    };

    checkAdminPath();
    window.addEventListener("popstate", checkAdminPath);
    window.addEventListener("hashchange", checkAdminPath);
    return () => {
      window.removeEventListener("popstate", checkAdminPath);
      window.removeEventListener("hashchange", checkAdminPath);
    };
  }, [isSellerMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOES, JSON.stringify(shoes));
  }, [shoes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(storeConfig));
  }, [storeConfig]);

  // Sincronización con la nube de Supabase y canal Realtime
  useEffect(() => {
    if (!isCloudConfigured(storeConfig)) return;

    let isMounted = true;

    // 1. Descargar catálogo desde la nube
    fetchShoesFromCloud(storeConfig).then((cloudShoes) => {
      if (!isMounted) return;
      if (cloudShoes && cloudShoes.length > 0) {
        setShoes(cloudShoes);
      } else if (cloudShoes && cloudShoes.length === 0 && shoes.length > 0) {
        // Inicializar la tabla en Supabase si está vacía
        saveBatchShoesToCloud(shoes, storeConfig);
      }
    });

    // 2. Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToRealtimeShoes(storeConfig, (payload) => {
      if (!isMounted) return;
      const { eventType, new: newRow, old: oldRow } = payload;

      if (eventType === 'INSERT') {
        const newShoe = mapRowToShoe(newRow);
        setShoes((prev) => {
          if (prev.some((s) => s.id === newShoe.id)) return prev;
          return [newShoe, ...prev];
        });
      } else if (eventType === 'UPDATE') {
        const updatedShoe = mapRowToShoe(newRow);
        setShoes((prev) =>
          prev.map((s) => (s.id === updatedShoe.id ? updatedShoe : s))
        );
      } else if (eventType === 'DELETE') {
        setShoes((prev) => prev.filter((s) => s.id !== oldRow.id));
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [storeConfig.supabaseUrl, storeConfig.supabaseAnonKey]);

  // Mostrar mensaje toast temporal
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Filtrado y ordenamiento de zapatos
  const filteredShoes = useMemo(() => {
    return shoes.filter((shoe) => {
      // Búsqueda por texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (shoe.name || "").toLowerCase().includes(query);
        const matchBrand = (shoe.brand || "").toLowerCase().includes(query);
        const matchDesc = (shoe.description || "").toLowerCase().includes(query);
        const matchCat = (shoe.category || "").toLowerCase().includes(query);
        const matchColor = shoe.colors?.some((c) => c.toLowerCase().includes(query));
        if (!matchTitle && !matchBrand && !matchDesc && !matchCat && !matchColor) return false;
      }

      // Categoría
      if (selectedCategory !== "Todos" && shoe.category !== selectedCategory) {
        return false;
      }

      // Género
      if (selectedGender !== "Todos") {
        if (selectedGender === "Hombre" && shoe.gender !== "Hombre" && shoe.gender !== "Unisex") return false;
        if (selectedGender === "Mujer" && shoe.gender !== "Mujer" && shoe.gender !== "Unisex") return false;
        if (selectedGender === "Unisex" && shoe.gender !== "Unisex") return false;
      }

      // Talla
      if (selectedSize !== null) {
        if (!shoe.sizes?.includes(Number(selectedSize))) return false;
      }

      // Ofertas
      if (onlyOffers && !shoe.discount) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return Number(a.price) - Number(b.price);
      if (sortBy === "price-high") return Number(b.price) - Number(a.price);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "newest") return (b.isAiAnalyzed ? 1 : 0) - (a.isAiAnalyzed ? 1 : 0);
      // featured default
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [shoes, searchQuery, selectedCategory, selectedGender, selectedSize, onlyOffers, sortBy]);

  // Manejo de Carrito
  const handleAddToCart = (shoe, chosenSize = null) => {
    const sizeToUse = chosenSize || shoe.sizes?.[0] || 40;
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === shoe.id && item.selectedSize === sizeToUse
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      } else {
        return [
          ...prev,
          {
            id: shoe.id,
            name: shoe.name,
            price: shoe.price,
            images: shoe.images,
            selectedSize: sizeToUse,
            quantity: 1
          }
        ];
      }
    });

    showToast(`👟 ¡Añadido al carrito: ${shoe.name} (Talla ${sizeToUse})!`);
  };

  const handleUpdateQuantity = (id, size, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedSize === size
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveItem = (id, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.selectedSize === size))
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Pedido Directo a WhatsApp para un solo par
  const handleDirectWhatsApp = (shoe, chosenSize = null) => {
    const sizeToUse = chosenSize || shoe.sizes?.[0] || 40;
    const currency = storeConfig.currency || "$";
    const cleanNumber = (storeConfig.whatsappNumber || "1234567890").replace(/[^0-9]/g, '');

    const message = `👟 *¡HOLA! ME INTERESA ESTE CALZADO DE TU TIENDA* 👟\n\n` +
      `📌 *Producto:* ${shoe.name}\n` +
      `📏 *Talla solicitada:* ${sizeToUse}\n` +
      `💰 *Precio:* ${formatPrice(shoe.price, currency)}\n` +
      `🎨 *Color:* ${shoe.colors?.join(", ") || "Estándar"}\n` +
      `📦 *Referencia:* ${shoe.id}\n\n` +
      `¿Tienen disponibilidad en esa talla para coordinar la compra y el envío? ¡Muchas gracias!`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Abrir modal de login de admin
  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  // Al ingresar el PIN correcto
  const handleSuccessLogin = () => {
    setIsSellerMode(true);
    setIsLoginModalOpen(false);
    showToast("🔓 ¡Modo Administrador Desbloqueado! Acceso total a subida con IA y configuración.");
  };

  // Bloquear / Cerrar sesión de administrador
  const handleLogoutSeller = () => {
    setIsSellerMode(false);
    showToast("🔒 Sesión de Administrador cerrada. Tienda bloqueada en vista cliente.");
  };

  // Compartir enlace limpio de cliente
  const handleShareStore = () => {
    const cleanUrl = window.location.origin + window.location.pathname;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanUrl).then(() => {
        showToast("🔗 ¡Enlace de cliente copiado! Compártelo por WhatsApp o redes.");
      }).catch(() => {
        showToast("🔗 Enlace: " + cleanUrl);
      });
    } else {
      showToast("🔗 Enlace: " + cleanUrl);
    }
  };

  // Contacto general de WhatsApp
  const handleContactWhatsApp = () => {
    const cleanNumber = (storeConfig.whatsappNumber || "1234567890").replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `¡Hola! Estoy visitando el catálogo de ${storeConfig.storeName} y tengo una consulta sobre sus calzados.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank');
  };

  // Subir zapatos nuevos desde la galería (Admin / IA)
  const handleAddNewShoes = (newShoes) => {
    setShoes((prev) => [...newShoes, ...prev]);
    if (isCloudConfigured(storeConfig)) {
      saveBatchShoesToCloud(newShoes, storeConfig);
    }
    showToast(`🎉 ¡${newShoes.length} ${newShoes.length === 1 ? 'modelo publicado' : 'modelos publicados'} con éxito en la tienda!`);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Actualizar datos de un zapato en modo maestro
  const handleSaveShoe = (updatedShoe) => {
    setShoes((prev) =>
      prev.map((s) => (s.id === updatedShoe.id ? updatedShoe : s))
    );
    if (isCloudConfigured(storeConfig)) {
      saveShoeToCloud(updatedShoe, storeConfig);
    }
    if (detailModalShoe && detailModalShoe.id === updatedShoe.id) {
      setDetailModalShoe(updatedShoe);
    }
    showToast(`✅ ¡Calzado "${updatedShoe.name}" actualizado con éxito!`);
  };

  // Guardar lote de precios desde el Gestor de Precios
  const handleSaveBatchPrices = (updatedShoes) => {
    setShoes(updatedShoes);
    if (isCloudConfigured(storeConfig)) {
      saveBatchShoesToCloud(updatedShoes, storeConfig);
    }
    showToast("💲 ¡Precios y ofertas actualizados en todo el catálogo!");
  };

  // Eliminar zapato del catálogo
  const handleDeleteShoe = (shoeId) => {
    setShoes((prev) => prev.filter((s) => s.id !== shoeId));
    if (isCloudConfigured(storeConfig)) {
      deleteShoeFromCloud(shoeId, storeConfig);
    }
    if (detailModalShoe && detailModalShoe.id === shoeId) {
      setDetailModalShoe(null);
    }
    showToast("🗑️ Calzado eliminado del catálogo.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-slideDown">
          <span className="text-emerald-400 font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        storeConfig={storeConfig}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenUploader={() => setIsUploaderOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPriceManager={() => setIsPriceManagerOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalProductsCount={shoes.length}
        isSellerMode={isSellerMode}
        onOpenLoginModal={handleOpenLoginModal}
        onLogoutSeller={handleLogoutSeller}
        onShareStore={handleShareStore}
      />

      {/* Main Content */}
      <main className="flex-1 pb-24">
        
        {/* Banner de estado exclusivo de administrador si está autenticado */}
        {isSellerMode && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
            <div className="p-3 px-4 rounded-2xl text-xs font-semibold flex items-center justify-between border bg-amber-500/10 border-amber-400/30 text-amber-900 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚡ <strong>Modo Administrador Activo:</strong> Tienes permisos para vincular fotos de tu galería y cambiar precios.</span>
              </div>
              <button
                onClick={handleLogoutSeller}
                className="font-bold bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-xl text-amber-950 transition-all flex items-center gap-1.5 shrink-0 ml-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Bloquear y Salir</span>
              </button>
            </div>
          </div>
        )}

        {/* Hero Banner */}
        <HeroBanner
          storeConfig={storeConfig}
          onExploreTrending={() => {
            setSelectedCategory("Todos");
            setSortBy("featured");
            window.scrollTo({ top: 500, behavior: 'smooth' });
          }}
          onOpenUploader={() => setIsUploaderOpen(true)}
          isSellerMode={isSellerMode}
          onContactWhatsApp={handleContactWhatsApp}
        />

        {/* Filters & Sorting Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          onlyOffers={onlyOffers}
          setOnlyOffers={setOnlyOffers}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalResults={filteredShoes.length}
        />

        {/* Product Catalog Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          
          {filteredShoes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
                🔍
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No se encontraron zapatos con estos filtros
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Prueba cambiando la categoría, eliminando la talla seleccionada o limpiando el texto de búsqueda.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("Todos");
                  setSelectedGender("Todos");
                  setSelectedSize(null);
                  setOnlyOffers(false);
                  setSearchQuery("");
                }}
                className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all"
              >
                Restablecer todos los filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredShoes.map((shoe) => (
                <ShoeCard
                  key={shoe.id}
                  shoe={shoe}
                  storeConfig={storeConfig}
                  onViewDetails={(s) => setDetailModalShoe(s)}
                  onAddToCart={(s) => handleAddToCart(s)}
                  onDirectWhatsApp={(s) => handleDirectWhatsApp(s)}
                  isSellerMode={isSellerMode}
                  onEditShoe={(s) => setEditingShoe(s)}
                />
              ))}
            </div>
          )}

        </section>

      </main>

      {/* Floating Action Bar for Mobile Convenience */}
      <div className="fixed bottom-4 left-4 right-4 z-30 md:hidden flex items-center justify-between gap-2 p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl">
        {isSellerMode ? (
          <button
            onClick={() => setIsUploaderOpen(true)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Subir Fotos Galería</span>
          </button>
        ) : (
          <button
            onClick={handleContactWhatsApp}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Pedir Asesoría por WhatsApp</span>
          </button>
        )}

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 flex items-center justify-center active:scale-95"
        >
          <ShoppingBag className="w-5 h-5 text-emerald-400" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-2xl">👟</span>
              <h4 className="font-extrabold text-lg text-white">
                {storeConfig.storeName}
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Plataforma optimizada para venta de calzado por WhatsApp con reconocimiento de fotos por IA.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span>WhatsApp: <strong className="text-emerald-400">+{storeConfig.whatsappNumber}</strong></span>
            <span>•</span>
            {isSellerMode ? (
              <>
                <button
                  onClick={handleLogoutSeller}
                  className="text-rose-400 hover:text-rose-300 font-bold underline flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Bloquear Modo Admin</span>
                </button>
                <span>•</span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-slate-300 hover:text-white underline"
                >
                  Configurar tienda
                </button>
              </>
            ) : (
              <button
                onClick={handleOpenLoginModal}
                className="text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
                title="Acceso exclusivo del dueño para subir fotos y gestionar precios"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Acceso Propietario (PIN)</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modales */}
      <ShoeDetailModal
        shoe={detailModalShoe}
        storeConfig={storeConfig}
        isOpen={Boolean(detailModalShoe)}
        onClose={() => setDetailModalShoe(null)}
        onAddToCart={(s, size) => handleAddToCart(s, size)}
        onDirectWhatsApp={(s, size) => handleDirectWhatsApp(s, size)}
        isSellerMode={isSellerMode}
        onEditShoe={(s) => setEditingShoe(s)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        storeConfig={storeConfig}
      />

      <AdminUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onAddNewShoes={handleAddNewShoes}
        storeConfig={storeConfig}
      />

      <StoreSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        storeConfig={storeConfig}
        onSaveConfig={(newConfig) => {
          setStoreConfig(newConfig);
          showToast("⚙️ Configuración guardada correctamente");
        }}
        onResetCatalog={() => {
          setShoes(INITIAL_SHOES);
          showToast("🔄 Catálogo restaurado al inicial");
        }}
        catalogData={shoes}
        onImportCatalog={(imported) => setShoes(imported)}
        onCloudSyncSuccess={(cloudShoes) => {
          setShoes(cloudShoes);
          showToast("☁️ ¡Catálogo sincronizado exitosamente con Supabase!");
        }}
      />

      {/* Modal de Autenticación de Administrador */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessLogin={handleSuccessLogin}
        correctPassword={String(storeConfig.adminPin || "CalzadosAdmin2026*")}
      />

      {/* Modal de Edición Completa en Modo Maestro */}
      <EditShoeModal
        isOpen={Boolean(editingShoe)}
        shoe={editingShoe}
        onClose={() => setEditingShoe(null)}
        onSaveShoe={handleSaveShoe}
        onDeleteShoe={handleDeleteShoe}
        storeConfig={storeConfig}
      />

      {/* Modal Gestor Rápido de Precios y Ofertas */}
      <PriceManagerModal
        isOpen={isPriceManagerOpen}
        onClose={() => setIsPriceManagerOpen(false)}
        shoes={shoes}
        onSaveBatchPrices={handleSaveBatchPrices}
        storeConfig={storeConfig}
        onUpdateStoreConfig={(cfg) => {
          setStoreConfig(cfg);
          showToast("⚙️ Moneda y configuración de tienda actualizadas");
        }}
      />

    </div>
  );
}
