import React from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatPrice } from '../utils/formatCurrency';

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  storeConfig
}) {
  if (!isOpen) return null;

  const currency = storeConfig.currency || "$";
  const OFFICIAL_WHATSAPP = "573176535909";
  const rawNumber = storeConfig.whatsappNumber || OFFICIAL_WHATSAPP;
  const whatsappNumber = (!rawNumber || rawNumber === "1234567890" || rawNumber.includes("573001234567")) ? OFFICIAL_WHATSAPP : rawNumber;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) * item.quantity),
    0
  );

  const handleSendWhatsAppOrder = () => {
    if (cartItems.length === 0) return;

    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    // Formatear mensaje para WhatsApp
    let message = `👟 *¡HOLA! DESEO HACER UN PEDIDO DE CALZADO* 👟\n\n`;
    message += `📋 *Detalle del Pedido:*\n`;

    cartItems.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   • Talla: *${item.selectedSize || "Estándar"}*\n`;
      message += `   • Cantidad: ${item.quantity}\n`;
      message += `   • Subtotal: ${formatPrice(item.price * item.quantity, currency)}\n`;
      message += `   • Ref: ${item.id}\n\n`;
    });

    message += `💰 *TOTAL A PAGAR: ${formatPrice(totalAmount, currency)}*\n\n`;
    message += `📍 *Por favor confírmame disponibilidad y datos para el pago y envío.*`;

    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '') || OFFICIAL_WHATSAPP;
    const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base sm:text-lg">Tu Carrito de Calzado</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} pares
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-3xl">
                  👟
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Tu carrito está vacío</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Explora nuestra colección y añade los zapatos en tu talla para enviarle tu pedido al vendedor por WhatsApp.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
                >
                  Ver Catálogo de Zapatos
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}`}
                  className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 items-center justify-between"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {item.name}
                    </h5>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                        Talla: {item.selectedSize || "N/A"}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-800">
                        {formatPrice(item.price, currency)}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id, item.selectedSize)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Eliminar par"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Total item price */}
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900">
                      {formatPrice(item.price * item.quantity, currency)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Send WhatsApp Button */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal productos:</span>
                  <span>{formatPrice(totalAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Envío:</span>
                  <span className="text-emerald-600 font-semibold">A coordinar por WhatsApp</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total estimado:</span>
                  <span className="text-xl text-emerald-600">{formatPrice(totalAmount, currency)}</span>
                </div>
              </div>

              <button
                onClick={handleSendWhatsAppOrder}
                className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 active:scale-95 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                <span>Enviar Pedido por WhatsApp</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Atención rápida sin comisiones</span>
                <button
                  onClick={onClearCart}
                  className="hover:text-rose-500 underline"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
