import React, { useState } from 'react';
import { X, DollarSign, Percent, TrendingUp, TrendingDown, Save, Check, RefreshCw, Sparkles, Tag, AlertCircle } from 'lucide-react';

export function PriceManagerModal({
  isOpen,
  onClose,
  shoes,
  onSaveBatchPrices,
  storeConfig,
  onUpdateStoreConfig
}) {
  if (!isOpen) return null;

  const [activeCurrency, setActiveCurrency] = useState(() => {
    const cur = storeConfig.currency;
    if (!cur || cur === "COP $" || cur === "COP" || cur === "$") return "$";
    return cur;
  });
  const displaySymbol = activeCurrency.includes('$') ? '$' : activeCurrency.trim();
  const [editedPrices, setEditedPrices] = useState(() => {
    const map = {};
    shoes.forEach((shoe) => {
      map[shoe.id] = {
        price: shoe.price,
        originalPrice: shoe.originalPrice || "",
        discount: shoe.discount || ""
      };
    });
    return map;
  });

  const [bulkAdjustmentType, setBulkAdjustmentType] = useState("discount"); // "discount", "increase", "fixed"
  const [bulkAdjustmentValue, setBulkAdjustmentValue] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Manejo de cambio en un zapato individual
  const handlePriceChange = (id, newPrice) => {
    setEditedPrices((prev) => {
      const current = prev[id] || {};
      const numPrice = Number(newPrice) || 0;
      const numOrig = Number(current.originalPrice) || 0;

      let calcDiscount = "";
      if (numOrig > numPrice && numPrice > 0) {
        const pct = Math.round(((numOrig - numPrice) / numOrig) * 100);
        calcDiscount = `${pct}% OFF`;
      }

      return {
        ...prev,
        [id]: {
          ...current,
          price: newPrice,
          discount: calcDiscount
        }
      };
    });
  };

  const handleOriginalPriceChange = (id, newOriginalPrice) => {
    setEditedPrices((prev) => {
      const current = prev[id] || {};
      const numPrice = Number(current.price) || 0;
      const numOrig = Number(newOriginalPrice) || 0;

      let calcDiscount = "";
      if (numOrig > numPrice && numPrice > 0) {
        const pct = Math.round(((numOrig - numPrice) / numOrig) * 100);
        calcDiscount = `${pct}% OFF`;
      }

      return {
        ...prev,
        [id]: {
          ...current,
          originalPrice: newOriginalPrice,
          discount: calcDiscount
        }
      };
    });
  };

  // Aplicar ajuste masivo a todos los calzados
  const handleApplyBulkAdjustment = () => {
    const val = Number(bulkAdjustmentValue);
    if (!val || val <= 0) {
      alert("Por favor ingresa un porcentaje o valor válido mayor a 0.");
      return;
    }

    setEditedPrices((prev) => {
      const next = { ...prev };
      shoes.forEach((shoe) => {
        const current = next[shoe.id] || { price: shoe.price, originalPrice: shoe.originalPrice || "" };
        const currentPrice = Number(current.price) || Number(shoe.price) || 0;

        if (bulkAdjustmentType === "discount") {
          // Aplicar descuento porcentual: el precio actual se convierte en original, y el nuevo precio se rebaja
          const newPrice = Math.round((currentPrice * (1 - val / 100)) * 100) / 100;
          next[shoe.id] = {
            price: newPrice,
            originalPrice: currentPrice,
            discount: `${Math.round(val)}% OFF`
          };
        } else if (bulkAdjustmentType === "increase") {
          // Aumento de precio general (+X%)
          const newPrice = Math.round((currentPrice * (1 + val / 100)) * 100) / 100;
          next[shoe.id] = {
            ...current,
            price: newPrice
          };
        } else if (bulkAdjustmentType === "fixed") {
          // Fijar el mismo precio para todos
          const numOrig = Number(current.originalPrice) || 0;
          let calcDisc = "";
          if (numOrig > val) {
            const pct = Math.round(((numOrig - val) / numOrig) * 100);
            calcDisc = `${pct}% OFF`;
          }
          next[shoe.id] = {
            price: val,
            originalPrice: current.originalPrice,
            discount: calcDisc
          };
        }
      });
      return next;
    });

    setFeedbackMsg(`✨ ¡Ajuste masivo aplicado! Revisa la tabla y presiona "Guardar Todos los Precios".`);
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  // Guardar todos los cambios
  const handleSaveAll = () => {
    // Si cambió la moneda, actualizar en la tienda
    if (activeCurrency !== storeConfig.currency) {
      onUpdateStoreConfig({
        ...storeConfig,
        currency: activeCurrency
      });
    }

    // Actualizar los zapatos
    const updatedShoes = shoes.map((shoe) => {
      const edit = editedPrices[shoe.id];
      if (!edit) return shoe;
      return {
        ...shoe,
        price: Number(edit.price) || shoe.price,
        originalPrice: edit.originalPrice ? Number(edit.originalPrice) : undefined,
        discount: edit.discount || ""
      };
    });

    onSaveBatchPrices(updatedShoes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 transform transition-all my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Gestor Rápido de Precios y Ofertas</h3>
              <p className="text-xs text-slate-400">Modifica precios en lote o de forma individual para toda la tienda</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* 1. Selector de Moneda y Ajuste Masivo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Moneda */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                <span>Moneda de la Tienda</span>
              </label>
              <select
                value={activeCurrency}
                onChange={(e) => setActiveCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                <option value="$">$ (Formato Limpio Estándar)</option>
                <option value="COP $">COP $ (Pesos Colombianos)</option>
                <option value="MXN $">MXN $ (Pesos Mexicanos)</option>
                <option value="S/.">S/. (Soles Perú)</option>
                <option value="€">€ (Euros)</option>
                <option value="CLP $">CLP $ (Pesos Chilenos)</option>
                <option value="Bs.">Bs. (Bolívares / Bolivianos)</option>
              </select>
            </div>

            {/* Ajuste Masivo Global */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ajuste Rápido Global a Todo el Catálogo</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={bulkAdjustmentType}
                  onChange={(e) => setBulkAdjustmentType(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="discount">🔥 Aplicar Descuento (% OFF)</option>
                  <option value="increase">📈 Aumentar Precio (+ %)</option>
                  <option value="fixed">🎯 Fijar Mismo Precio ($)</option>
                </select>

                <div className="flex gap-2">
                  <div className="relative flex-1 sm:w-36">
                    <input
                      type="number"
                      step="any"
                      placeholder={
                        bulkAdjustmentType === "fixed"
                          ? "ej: 129000"
                          : bulkAdjustmentType === "increase"
                            ? "ej: 10 (+10%)"
                            : "ej: 20 (20% OFF)"
                      }
                      value={bulkAdjustmentValue}
                      onChange={(e) => setBulkAdjustmentValue(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyBulkAdjustment}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all shrink-0 shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Aplicar a Todos</span>
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {bulkAdjustmentType === "discount" && "Rebaja el porcentaje indicado a todos los zapatos y deja el precio anterior tachado."}
                {bulkAdjustmentType === "increase" && "Incrementa el porcentaje indicado sobre el precio actual de todos los zapatos."}
                {bulkAdjustmentType === "fixed" && "Establece exactamente el mismo valor de venta (ej: 129000) a todos los zapatos del catálogo."}
              </p>
            </div>
          </div>

          {feedbackMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl font-medium animate-fadeIn">
              {feedbackMsg}
            </div>
          )}

          {/* 2. Lista / Tabla Editable de Todos los Zapatos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Catálogo de Calzados ({shoes.length} modelos)
              </h4>
              <span className="text-[11px] text-slate-400">
                Los cambios se guardan al hacer clic en "Guardar Todos los Precios"
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[46vh] overflow-y-auto bg-white shadow-inner">
              {shoes.map((shoe) => {
                const edit = editedPrices[shoe.id] || { price: shoe.price, originalPrice: shoe.originalPrice || "", discount: shoe.discount || "" };
                return (
                  <div
                    key={shoe.id}
                    className="p-3 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    {/* Foto y Nombre */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={shoe.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100"}
                        alt={shoe.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {shoe.name}
                          </p>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500 shrink-0">
                            {shoe.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          Ref: {shoe.id} · Stock: {shoe.stock || 10} pares
                        </p>
                      </div>
                    </div>

                    {/* Inputs de Precios con Diseño Anti-Superposición */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                      {/* Precio de Venta */}
                      <div className="flex-1 sm:flex-initial">
                        <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-tight mb-1">
                          Precio Venta
                        </span>
                        <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 shadow-xs">
                          <span className="px-2.5 py-1.5 text-xs font-black text-slate-500 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                            {displaySymbol}
                          </span>
                          <input
                            type="number"
                            step="any"
                            value={edit.price}
                            onChange={(e) => handlePriceChange(shoe.id, e.target.value)}
                            className="w-full sm:w-28 px-2 py-1.5 bg-white text-xs sm:text-sm font-black text-slate-900 outline-none"
                          />
                        </div>
                      </div>

                      {/* Precio Original (Tachado) */}
                      <div className="flex-1 sm:flex-initial">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                          Original (Tachado)
                        </span>
                        <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 shadow-xs">
                          <span className="px-2.5 py-1.5 text-xs font-bold text-slate-400 bg-slate-50 border-r border-slate-200 select-none shrink-0">
                            {displaySymbol}
                          </span>
                          <input
                            type="number"
                            step="any"
                            placeholder="Opcional"
                            value={edit.originalPrice}
                            onChange={(e) => handleOriginalPriceChange(shoe.id, e.target.value)}
                            className="w-full sm:w-28 px-2 py-1.5 bg-white text-xs sm:text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-300"
                          />
                        </div>
                      </div>

                      {/* Badge de Descuento */}
                      <div className="shrink-0 self-end pb-1 sm:pb-0 text-center min-w-[55px]">
                        {edit.discount ? (
                          <span className="inline-block px-2 py-1 rounded-lg text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap shadow-xs">
                            {edit.discount}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-300">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Todos los Precios</span>
          </button>
        </div>

      </div>
    </div>
  );
}
