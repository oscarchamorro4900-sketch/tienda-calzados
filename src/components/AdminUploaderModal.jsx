import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  Palette,
  Layers,
  Wand2,
  Trash2,
  Check,
  ChevronRight
} from 'lucide-react';
import { analyzeShoeImage, fileToDataUrl, compressAndOptimizeImage } from '../utils/aiVisionSimulator';
import { isCloudConfigured, uploadImageToStorage } from '../lib/supabase';
import { CATEGORIES, GENDERS, SIZES } from '../data/initialShoes';

export function AdminUploaderModal({
  isOpen,
  onClose,
  onAddNewShoes,
  storeConfig
}) {
  if (!isOpen) return null;

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState("");
  const [pendingShoes, setPendingShoes] = useState([]);
  const [activeQueueIndex, setActiveQueueIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Procesar archivos subidos desde la galería del dispositivo o cámara
  const handleFilesSelected = async (files) => {
    if (!files || files.length === 0) return;

    setAnalyzing(true);
    const newItems = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setAnalyzingStep(`Procesando foto ${i + 1} de ${files.length}: Optimizando imagen...`);

      try {
        const { optimizedDataUrl, optimizedBlob } = await compressAndOptimizeImage(file);
        let finalImageUrl = optimizedDataUrl;

        // Si Supabase está conectado, subir al bucket de almacenamiento público
        if (isCloudConfigured(storeConfig)) {
          setAnalyzingStep(`Subiendo foto ${i + 1} de ${files.length} a Supabase Storage...`);
          const cloudUrl = await uploadImageToStorage(optimizedBlob, storeConfig);
          if (cloudUrl) {
            finalImageUrl = cloudUrl;
          }
        }

        setAnalyzingStep(`Analizando calzado ${i + 1} con IA: Detectando estilo y colores...`);
        const analyzedData = await analyzeShoeImage(file, finalImageUrl, storeConfig.geminiApiKey);

        newItems.push({
          ...analyzedData,
          fileOriginalName: file.name
        });
      } catch (err) {
        console.error("Error analizando imagen:", err);
      }
    }

    setAnalyzing(false);
    setAnalyzingStep("");

    if (newItems.length > 0) {
      setPendingShoes((prev) => [...prev, ...newItems]);
      setActiveQueueIndex(pendingShoes.length);
    }
  };

  // Manejador para inputs nativos
  const onFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    handleFilesSelected(files);
  };

  // Drag & drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  // Editar datos del zapato activo antes de publicar
  const updateCurrentShoe = (field, value) => {
    setPendingShoes((prev) => {
      const copy = [...prev];
      copy[activeQueueIndex] = {
        ...copy[activeQueueIndex],
        [field]: value
      };
      return copy;
    });
  };

  const toggleSize = (size) => {
    const currentSizes = currentShoe.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size].sort((a, b) => a - b);
    updateCurrentShoe('sizes', newSizes);
  };

  const removePendingShoe = (index) => {
    setPendingShoes((prev) => prev.filter((_, i) => i !== index));
    if (activeQueueIndex >= pendingShoes.length - 1) {
      setActiveQueueIndex(Math.max(0, pendingShoes.length - 2));
    }
  };

  // Guardar y publicar en el catálogo de la tienda
  const handlePublishAll = () => {
    if (pendingShoes.length === 0) return;
    onAddNewShoes(pendingShoes);
    setPendingShoes([]);
    onClose();
  };

  const currentShoe = pendingShoes[activeQueueIndex];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      
      {/* Hidden File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Main Modal Card */}
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 transform transition-all my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles className="w-5 h-5 fill-slate-950 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Vincular Galería & Subida Inteligente con IA
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona fotos de calzado y la IA reconocerá estilo, colores, talla y precio sugerido.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Picker Buttons (Gallery vs Camera) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Gallery Button */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-slate-800 flex items-center gap-4 transition-all text-left group active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-sm sm:text-base text-emerald-950 block">
                  Abrir Galería del Dispositivo
                </span>
                <span className="text-xs text-emerald-700">
                  Sube 1 o varias fotos a la vez desde tu celular o PC
                </span>
              </div>
            </button>

            {/* Camera Button */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-teal-500 bg-teal-50/50 hover:bg-teal-50 text-slate-800 flex items-center gap-4 transition-all text-left group active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/30 group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-sm sm:text-base text-teal-950 block">
                  Tomar Foto con la Cámara
                </span>
                <span className="text-xs text-teal-700">
                  Captura el zapato ahora mismo con guía de encuadre
                </span>
              </div>
            </button>

          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center ${
              dragActive
                ? 'border-emerald-500 bg-emerald-100/40 scale-[1.01]'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
            }`}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-bounce" />
            <p className="text-xs font-semibold text-slate-600">
              O arrastra y suelta aquí las imágenes de tus zapatos
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Formatos soportados: JPG, PNG, WEBP, HEIC
            </p>
          </div>

          {/* Scanning / AI Analyzing Animation */}
          {analyzing && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white text-center space-y-3 shadow-lg border border-emerald-500/30 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mx-auto"></div>
              <h4 className="font-bold text-sm text-emerald-300">
                La Inteligencia Artificial está analizando las fotos...
              </h4>
              <p className="text-xs text-slate-300 font-mono">
                {analyzingStep}
              </p>
            </div>
          )}

          {/* Pending Queue & Active Shoe Form Editor */}
          {pendingShoes.length > 0 && currentShoe && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              
              {/* Queue Selector Tabs */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Fotos reconocidas ({pendingShoes.length}):
                </span>
                <span className="text-xs text-emerald-600 font-bold">
                  Editando foto {activeQueueIndex + 1} de {pendingShoes.length}
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {pendingShoes.map((shoe, idx) => (
                  <div
                    key={shoe.id || idx}
                    onClick={() => setActiveQueueIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${
                      activeQueueIndex === idx
                        ? 'border-emerald-500 ring-4 ring-emerald-500/20 scale-105'
                        : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={shoe.images[0]}
                      alt="Miniatura"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePendingShoe(idx);
                      }}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-sm"
                      title="Eliminar de la lista"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-black">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shoe Editor Form */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left: Preview Card */}
                <div className="md:col-span-5 space-y-3">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-inner border border-slate-200">
                    <img
                      src={currentShoe.images[0]}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Reconocido por IA</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-700 block">Detección de Color (Canvas):</span>
                    <div className="flex flex-wrap gap-1">
                      {currentShoe.colors?.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                          🎨 {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Fields to review & tweak */}
                <div className="md:col-span-7 space-y-4">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Título Comercial del Zapato
                    </label>
                    <input
                      type="text"
                      value={currentShoe.name || ""}
                      onChange={(e) => updateCurrentShoe('name', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Category & Gender */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Categoría
                      </label>
                      <select
                        value={currentShoe.category || "Deportivo"}
                        onChange={(e) => updateCurrentShoe('category', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
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
                        value={currentShoe.gender || "Unisex"}
                        onChange={(e) => updateCurrentShoe('gender', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      >
                        {GENDERS.filter((g) => g !== "Todos").map((gen) => (
                          <option key={gen} value={gen}>{gen}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price & Season Badge */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Precio ({storeConfig.currency || "$"})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={currentShoe.price || ""}
                          onChange={(e) => updateCurrentShoe('price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Distintivo de Temporada
                      </label>
                      <input
                        type="text"
                        value={currentShoe.seasonBadge || ""}
                        onChange={(e) => updateCurrentShoe('seasonBadge', e.target.value)}
                        placeholder="ej: 🔥 Tendencia 2026"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Sizes Stock Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tallas disponibles para la venta (haz clic para activar/desactivar)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SIZES.map((sz) => {
                        const isSelected = currentShoe.sizes?.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSize(sz)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-sm scale-105'
                                : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description Copy */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Descripción de Venta (Generada para WhatsApp)
                    </label>
                    <textarea
                      rows={2}
                      value={currentShoe.description || ""}
                      onChange={(e) => updateCurrentShoe('description', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-white">
          <div className="text-xs text-slate-400">
            {pendingShoes.length > 0 ? (
              <span>Listos para subir: <strong className="text-emerald-400">{pendingShoes.length}</strong> modelos</span>
            ) : (
              <span>Selecciona una o más fotos de tu celular para comenzar</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Cancelar
            </button>

            <button
              disabled={pendingShoes.length === 0}
              onClick={handlePublishAll}
              className={`px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
                pendingShoes.length > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 fill-current" />
              <span>Publicar {pendingShoes.length > 0 ? `(${pendingShoes.length})` : ''} en la Tienda</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
