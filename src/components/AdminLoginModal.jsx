import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function AdminLoginModal({
  isOpen,
  onClose,
  onSuccessLogin,
  correctPassword = "283113"
}) {
  if (!isOpen) return null;

  const [enteredPassword, setEnteredPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerify = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const cleanEntered = String(enteredPassword || "").trim();
    const cleanCorrect = String(correctPassword || "283113").trim();

    // Acepta la clave oficial 283113 o la configurada
    if (cleanEntered === "283113" || cleanEntered === cleanCorrect) {
      setErrorMsg("");
      setEnteredPassword("");
      onSuccessLogin();
    } else {
      setErrorMsg("Contraseña incorrecta. Acceso restringido únicamente al propietario.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      
      <div
        className="relative bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shield Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-slate-900/20 border border-slate-800">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Portal Maestro de Seguridad
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Acceso administrativo exclusivo para el propietario de la tienda.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Contraseña Maestra</span>
            </label>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                value={enteredPassword}
                onChange={(e) => {
                  setEnteredPassword(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Ingresa tu contraseña maestra"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <div className="mt-2 text-xs font-bold text-rose-600 flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
            🛡️ <strong>Seguridad activa:</strong> Esta pantalla está oculta para los clientes. Puedes cambiar tu contraseña en cualquier momento dentro de los ajustes.
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={!enteredPassword.trim()}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                enteredPassword.trim()
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ingresar al Modo Maestro</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-transparent hover:bg-slate-100 text-slate-600 text-xs font-semibold"
            >
              Volver a la Tienda
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
