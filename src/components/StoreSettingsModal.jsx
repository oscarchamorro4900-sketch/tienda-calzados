import React, { useState } from 'react';
import { X, Save, Phone, Store, DollarSign, Key, RotateCcw, Download, Upload, Check, Cloud, Database, Copy, RefreshCw, AlertCircle, CheckCircle2, HelpCircle, ExternalLink } from 'lucide-react';
import { SUPABASE_SQL_SCRIPT, isCloudConfigured, fetchShoesFromCloud, saveBatchShoesToCloud } from '../lib/supabase';

export function StoreSettingsModal({
  isOpen,
  onClose,
  storeConfig,
  onSaveConfig,
  onResetCatalog,
  catalogData,
  onImportCatalog,
  onCloudSyncSuccess
}) {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    storeName: storeConfig.storeName || "Calzados Express",
    tagline: storeConfig.tagline || "Venta de calzado con pedidos a WhatsApp",
    whatsappNumber: storeConfig.whatsappNumber || "5215512345678",
    currency: storeConfig.currency || "$",
    geminiApiKey: storeConfig.geminiApiKey || "",
    adminPin: storeConfig.adminPin || "2026",
    supabaseUrl: storeConfig.supabaseUrl || "",
    supabaseAnonKey: storeConfig.supabaseAnonKey || ""
  });

  const [copiedSql, setCopiedSql] = useState(false);
  const [testingCloud, setTestingCloud] = useState(false);
  const [cloudStatusMsg, setCloudStatusMsg] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiStatusMsg, setGeminiStatusMsg] = useState(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(catalogData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `catalogo_zapatos_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImportCatalog(parsed);
          alert("¡Catálogo importado exitosamente con " + parsed.length + " modelos!");
          onClose();
        }
      } catch (err) {
        alert("Archivo JSON inválido.");
      }
    };
    reader.readAsText(file);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT).then(() => {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    });
  };

  const handleTestCloudConnection = async () => {
    if (!form.supabaseUrl || !form.supabaseAnonKey) {
      setCloudStatusMsg({ type: 'error', text: 'Por favor ingresa primero la URL y la Anon Key de Supabase.' });
      return;
    }

    setTestingCloud(true);
    setCloudStatusMsg(null);

    try {
      const shoes = await fetchShoesFromCloud(form);
      if (shoes !== null) {
        if (shoes.length === 0 && catalogData.length > 0) {
          await saveBatchShoesToCloud(catalogData, form);
          setCloudStatusMsg({
            type: 'success',
            text: `¡Conexión exitosa! Tabla vacía detectada: se migraron tus ${catalogData.length} modelos a Supabase automáticamente.`
          });
          if (onCloudSyncSuccess) onCloudSyncSuccess(catalogData);
        } else {
          setCloudStatusMsg({
            type: 'success',
            text: `¡Conexión verificada! Se encontraron ${shoes.length} zapatos sincronizados en la nube.`
          });
          if (onCloudSyncSuccess && shoes.length > 0) onCloudSyncSuccess(shoes);
        }
      } else {
        setCloudStatusMsg({
          type: 'error',
          text: 'No se pudo conectar a la tabla "shoes". Asegúrate de haber ejecutado el script SQL en el panel de Supabase.'
        });
      }
    } catch (err) {
      setCloudStatusMsg({
        type: 'error',
        text: 'Error de red o credenciales incorrectas: ' + err.message
      });
    } finally {
      setTestingCloud(false);
    }
  };

  const handleTestGemini = async () => {
    if (!form.geminiApiKey || form.geminiApiKey.trim().length < 15) {
      setGeminiStatusMsg({ type: 'error', text: 'Por favor ingresa primero tu clave de Gemini (comienza con AIzaSy...).' });
      return;
    }

    setTestingGemini(true);
    setGeminiStatusMsg(null);

    try {
      // Usar el endpoint oficial ListModels para verificar la clave y obtener los modelos activos del proyecto
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${form.geminiApiKey.trim()}`
      );

      if (res.ok) {
        const data = await res.json();
        const models = data.models || [];
        const generateModels = models.filter((m) =>
          m.supportedGenerationMethods?.includes("generateContent")
        );

        const chosen =
          generateModels.find((m) => m.name?.includes("2.5-flash")) ||
          generateModels.find((m) => m.name?.includes("2.0-flash")) ||
          generateModels.find((m) => m.name?.includes("1.5-flash-latest")) ||
          generateModels.find((m) => m.name?.includes("flash")) ||
          generateModels[0];

        const modelDisplay = chosen ? (chosen.displayName || chosen.name.replace(/^models\//, '')) : "Gemini 2.0 Flash";

        setGeminiStatusMsg({
          type: 'success',
          text: `¡Clave de Gemini verificada con éxito! Modelo activo conectado: ${modelDisplay}.`
        });
      } else {
        const errJson = await res.json().catch(() => ({}));
        setGeminiStatusMsg({
          type: 'error',
          text: `Error de API (${res.status}): ${errJson.error?.message || 'Clave no válida o sin permisos'}`
        });
      }
    } catch (err) {
      setGeminiStatusMsg({
        type: 'error',
        text: 'Error de conexión probando Gemini: ' + err.message
      });
    } finally {
      setTestingGemini(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 transform transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">Configuración de la Tienda</h3>
            <p className="text-xs text-slate-400">Personaliza tu número de WhatsApp, moneda y marca</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          
          {/* WhatsApp Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Número de WhatsApp para recibir pedidos (con código de país)</span>
            </label>
            <input
              type="text"
              required
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              placeholder="ej: 5215512345678 (México) o 573001234567 (Colombia)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Coloca el número completo sin signos "+" ni espacios. Los clientes escribirán directo aquí.
            </p>
          </div>

          {/* Store Name & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-teal-600" />
                <span>Nombre de la Tienda</span>
              </label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                <span>Símbolo de Moneda</span>
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="COP $">COP $ (Pesos Colombianos)</option>
                <option value="$">$ (Dólares / Pesos)</option>
                <option value="S/.">S/. (Soles Perú)</option>
                <option value="€">€ (Euros)</option>
                <option value="MXN $">MXN $ (Pesos Mexicanos)</option>
                <option value="CLP $">CLP $ (Pesos Chilenos)</option>
                <option value="Bs.">Bs. (Bolívares / Bolivianos)</option>
              </select>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Eslogan o Subtítulo
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Contraseña Maestra de Seguridad */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>Contraseña Maestra del Administrador</span>
            </label>
            <input
              type="text"
              required
              value={form.adminPin}
              onChange={(e) => setForm({ ...form, adminPin: e.target.value })}
              placeholder="Escribe tu contraseña maestra segura"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              🔒 Define aquí tu contraseña maestra personal. Solo quien ingrese esta clave por la ruta secreta /admin podrá acceder al Modo Maestro.
            </p>
          </div>

          {/* Gemini API Key (Opcional) */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-600" />
                <span>Google Gemini API Key (IA de Visión)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1"
                title="Abrir Google AI Studio para generar clave gratuita"
              >
                <span>Obtener clave gratis</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={form.geminiApiKey}
                onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value.trim() })}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                disabled={testingGemini || !form.geminiApiKey}
                onClick={handleTestGemini}
                className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingGemini ? 'animate-spin' : ''}`} />
                <span>{testingGemini ? "Probando..." : "Probar Clave"}</span>
              </button>
            </div>

            {/* Mensaje de estado de prueba de Gemini */}
            {geminiStatusMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                geminiStatusMsg.type === 'success'
                  ? 'bg-purple-50 border-purple-200 text-purple-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {geminiStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{geminiStatusMsg.text}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              ⚡ Permite que la IA de Google reconozca el modelo exacto, estilo y redacte la descripción de venta de cada zapato que subas. Si la dejas vacía, la app usará el analizador local de colores.
            </p>
          </div>

          {/* Sincronización en la Nube (Supabase) */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Base de Datos en la Nube (Supabase)
                </span>
              </div>
              {isCloudConfigured(form) ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Conectado a la Nube
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  Modo Local / Desconectado
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Conecta tu proyecto gratuito de Supabase para que las fotos que subas desde tu celular se actualicen en vivo para todos los clientes del mundo.
            </p>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  Project URL de Supabase
                </label>
                <input
                  type="url"
                  value={form.supabaseUrl}
                  onChange={(e) => setForm({ ...form, supabaseUrl: e.target.value.trim() })}
                  placeholder="https://xyzabcdefg.supabase.co"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  Anon / Public API Key
                </label>
                <input
                  type="password"
                  value={form.supabaseAnonKey}
                  onChange={(e) => setForm({ ...form, supabaseAnonKey: e.target.value.trim() })}
                  placeholder="eyJhbGciOi..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Acciones de Supabase: Copiar SQL y Probar Conexión */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Copiar script SQL para ejecutar en el SQL Editor de Supabase"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? "¡SQL Copiado!" : "Copiar Script SQL"}</span>
              </button>

              <button
                type="button"
                disabled={testingCloud}
                onClick={handleTestCloudConnection}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingCloud ? 'animate-spin' : ''}`} />
                <span>{testingCloud ? "Probando..." : "Probar y Sincronizar"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-all ml-auto"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showGuide ? "Ocultar guía" : "¿Cómo configurar?"}</span>
              </button>
            </div>

            {/* Guía Paso a Paso Desplegable */}
            {showGuide && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-[11px] text-slate-700 space-y-2 animate-fadeIn">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                  <span>⚡ 3 Pasos Rápidos para Activar Supabase (Gratis):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 pl-0.5 leading-relaxed text-slate-600">
                  <li>
                    Entra a <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a> y crea un nuevo proyecto gratuito.
                  </li>
                  <li>
                    En el menú lateral de Supabase, entra a <strong>SQL Editor</strong>, haz clic en el botón <strong className="text-slate-900">"Copiar Script SQL"</strong> de aquí arriba, pégalo en Supabase y presiona el botón verde <strong>RUN</strong>.
                  </li>
                  <li>
                    Ve a <strong>Project Settings (ícono de tuerca) &gt; API</strong>, copia tu <strong>Project URL</strong> y tu <strong>anon public key</strong>, pégalos en las casillas de arriba y haz clic en <strong>"Probar y Sincronizar"</strong>.
                  </li>
                </ol>
                <p className="text-[10px] text-emerald-800 font-semibold pt-1 border-t border-emerald-200/60">
                  ✅ Listo: ¡Cualquier calzado o foto que subas desde tu celular aparecerá en vivo en las pantallas de todos los clientes sin necesidad de recargar!
                </p>
              </div>
            )}

            {/* Mensaje de estado de la prueba */}
            {cloudStatusMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                cloudStatusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {cloudStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{cloudStatusMsg.text}</span>
              </div>
            )}
          </div>

          {/* Backup / Export / Reset Tools */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                title="Descargar copia de seguridad en JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Catálogo</span>
              </button>

              <label className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJson}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm("¿Deseas restaurar el catálogo inicial de demostración?")) {
                  onResetCatalog();
                  onClose();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar demo</span>
            </button>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
