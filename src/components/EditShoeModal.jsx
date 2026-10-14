import React, { useState, useRef } from 'react';
import { X, Save, Trash2, Upload, Plus, Tag, DollarSign, Package, Sparkles, AlertTriangle, Layers, Palette } from 'lucide-react';
import { CATEGORIES, GENDERS, SIZES } from '../data/initialShoes';
import { fileToDataUrl, extractDominantColors, compressAndOptimizeImage } from '../utils/aiVisionSimulator';
import { isCloudConfigured, uploadImageToStorage } from '../lib/supabase';

export function EditShoeModal({
  isOpen,
  shoe,
  onClose,
  onSaveShoe,
  onDeleteShoe,
  storeConfig
}) {
  if (!isOpen || !shoe) return null;

  const currency = storeConfig.currency || "$";
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: shoe.name || "",
    brand: shoe.brand || "",
    category: shoe.category || "Deportivo",
    gender: shoe.gender || "Unisex",
    price: shoe.price || 0,
    originalPrice: shoe.originalPrice || 0,
    discount: shoe.discount || "",
    stock: shoe.stock !== undefined ? shoe.stock : 10,
    seasonBadge: shoe.seasonBadge || "",
    material: shoe.material || "",
    colors: shoe.colors || ["Negro"],
    sizes: shoe.sizes || [38, 39, 40, 41, 42],
    description: shoe.description || "",
    images: shoe.images || [],
    featured: shoe.featured || false
  });

  const [newColorInput, setNewColorInput] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Alternar tallas
  const toggleSize = (size) => {
    const current = form.sizes || [];
    const updated = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size].sort((a, b) => a - b);
    setForm({ ...form, sizes: updated });
  };

  // Agregar color
  const handleAddColor = () => {
    if (!newColorInput.trim()) return;
    if (!form.colors.includes(newColorInput.trim())) {
      setForm({ ...form, colors: [...form.colors, newColorInput.trim()] });
    }
    setNewColorInput("");
  };

  const handleRemoveColor = (colorToRemove) => {
    setForm({ ...form, colors: form.colors.filter((c) => c !== colorToRemove) });
  };

  // Subir nueva foto desde la galería del dispositivo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { optimizedDataUrl, optimizedBlob } = await compressAndOptimizeImage(file);
      let finalImageUrl = optimizedDataUrl;

      if (isCloudConfigured(storeConfig)) {
        const cloudUrl = await uploadImageToStorage(optimizedBlob, storeConfig);
        if (cloudUrl) {
          finalImageUrl = cloudUrl;
        }
      }

      setForm((prev) => ({
        ...prev,
        images: [finalImageUrl, ...prev.images]
      }));
    } catch (err) {
      console.error("Error subiendo foto:", err);
    }
  };

  // Eliminar foto
  const handleRemoveImage = (indexToRemove) => {
    if (form.images.length <= 1) {
      alert("El calzado debe tener al menos 1 fotografía.");
      return;
    }
    setForm({
      ...form,
      images: form.images.filter((_, idx) => idx !== indexToRemove)
    });
  };

  // Agregar foto por URL externa
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setForm({
      ...form,
      images: [...form.images, newImageUrl.trim()]
    });
    setNewImageUrl("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Auto calcular descuento si hay precio original superior
    let calculatedDiscount = form.discount;
    if (form.originalPrice > form.price && form.originalPrice > 0) {
      const pct = Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100);
      calculatedDiscount = `${pct}% OFF`;
    }

    const updated = {
      ...shoe,
      ...form,
      discount: calculatedDiscount,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      stock: Number(form.stock)
    };

    onSaveShoe(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      
      {/* Input de archivo oculto para la galería del dispositivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 transform transition-all my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Modal */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              ✏️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">Configurar Calzado (Modo Maestro)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-amber-400 border border-slate-700">
                  {shoe.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">Edita precio, fotos, descripción, tallas y stock en vivo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* 1. Galería de Fotos del Calzado */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Fotos del Zapato ({form.images.length})</span>
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Subir de mi Galería</span>
              </button>
            </div>

            {/* Grid de Fotos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 group bg-slate-100">
                  <img src={img} alt="Calzado" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-black">
                    {idx === 0 ? "Principal" : `#${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md opacity-80 group-hover:opacity-100 transition-opacity"
                    title="Eliminar foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Añadir foto por URL externa */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                placeholder="O pega una URL de imagen web (ej: https://...jpg)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Añadir URL
              </button>
            </div>
          </div>

          {/* 2. Título Comercial y Marca */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nombre / Título Comercial
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Marca o Fabricante
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="ej: Nike, Adidas, Artesanal"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 3. Categoría, Género y Distintivo de Temporada */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.filter((c) => c !== "Todos").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Público / Género
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                {GENDERS.filter((g) => g !== "Todos").map((gen) => (
                  <option key={gen} value={gen}>{gen}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Distintivo de Temporada</span>
              </label>
              <input
                type="text"
                value={form.seasonBadge}
                onChange={(e) => setForm({ ...form, seasonBadge: e.target.value })}
                placeholder="ej: 🔥 Tendencia 2026"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 4. Precios, Descuentos y Stock */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Precio Venta ({currency})</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Precio Original ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                placeholder="ej: 180000"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-600 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Aparecerá tachado</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                <span>Pares en Stock</span>
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-col justify-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Destacado en Portada
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span>Mostrar como Destacado</span>
              </label>
            </div>
          </div>

          {/* 5. Tallas Disponibles (Selector Interactivo de Chips) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Tallas Disponibles ({form.sizes.length} activas)</span>
              </label>
              <span className="text-xs text-slate-400">Haz clic en cada número para encender/apagar</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {SIZES.map((sz) => {
                const isSelected = form.sizes?.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`min-w-10 h-10 px-3 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Material y Colores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Material y Suela
              </label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                placeholder="ej: Cuero genuino y suela de caucho vulcanizado"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-600" />
                <span>Colores</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.colors?.map((color, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color)}
                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Agregar color..."
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColor();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* 7. Descripción Comercial */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descripción Comercial (Texto enviado al cliente o por WhatsApp)
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Zona de Peligro: Eliminar Calzado */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 hover:underline"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar este zapato del catálogo</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-rose-50 p-3 rounded-xl border border-rose-200 w-full justify-between">
                <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>¿Confirmas eliminar este modelo permanentemente?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-xs text-slate-700"
                  >
                    No, conservar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteShoe(shoe.id);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                  >
                    Sí, eliminar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Todo</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
