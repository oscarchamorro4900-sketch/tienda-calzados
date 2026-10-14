# 👟 Calzados Temporada - PWA & Catálogo Inteligente con Pedidos a WhatsApp

Plataforma web adaptable (PWA) de alto rendimiento diseñada específicamente para la venta de calzado de temporada con vinculación directa a la galería del dispositivo móvil y reconocimiento asistido por IA.

---

## 🌟 Características Principales

### 1. 📲 Vinculación con la Galería del Dispositivo y Cámara
- **Acceso directo a la galería de fotos:** Sube 1 o múltiples fotos de zapatos a la vez directamente desde tu teléfono móvil o computadora.
- **Toma de fotos con la cámara trasera:** Captura el calzado en el instante con guía de encuadre.
- **Análisis Inteligente por IA (Canvas & Computer Vision):**
  - Muestreo y extracción de colores físicos dominantes (Blanco, Negro, Rojo, Azul, Marrón, Beige, etc.).
  - Deducción automática de la categoría (Deportivo, Botas, Casual, Formal, Sandalias).
  - Generación de copywriting comercial persuasivo para WhatsApp.
  - Sugerencia de tallas comerciales y precio de mercado.
  - Distintivo de temporada (*"🔥 Tendencia 2026"*, *"🍂 Otoño/Invierno"*, *"☀️ Verano"*).
- **Publicación Inmediata:** Edita o confirma los datos en segundos y publica los zapatos en el catálogo visible al público. Persistencia automática en el almacenamiento local.
- **Botón "Configurar" en Cada Zapato (Modo Maestro):** Al estar en Modo Administrador, cada calzado en el catálogo muestra un botón directo para configurar en vivo:
  - Nombre comercial y marca.
  - Precio de venta, precio tachado anterior y cálculo automático de descuento.
  - Subida o reemplazo de fotos directamente desde la galería del dispositivo o URLs.
  - Tallas disponibles (selector interactivo de chips numéricos de la 35 a la 45).
  - Colores disponibles y materiales.
  - Pares en stock y casilla de producto destacado en portada.
  - Descripción y copywriting de venta.
  - Opción de eliminar el calzado de forma permanente con confirmación de seguridad.

### 2. 🔒 Seguridad y Protección de Administrador (PIN Maestro)
- **Modo Cliente por Defecto:** Cualquier visitante o cliente entra exclusivamente como comprador. Las opciones de subir fotos, cambiar precios o alterar la configuración están totalmente ocultas.
- **Acceso Protegido por PIN / Contraseña:** Para ingresar al panel de vendedor, se debe ingresar el PIN maestro (predeterminado: `2026`).
- **Protección contra Fuerza Bruta:** Bloqueo temporal tras múltiples intentos fallidos seguidos.
- **PIN Personalizable:** El dueño puede cambiar su PIN maestro en cualquier momento en el panel de configuración (⚙️).
- **Cierre de Sesión Inmediato:** Botón *"Bloquear y Salir"* en la cabecera para cerrar la sesión administrativa y dejar la tienda lista para clientes.

### 3. 💬 Catálogo de Ventas y Pedidos Directos por WhatsApp
- **Compra en 1 Clic:** El cliente selecciona su talla y presiona *"Pedir por WhatsApp"*. La aplicación genera y abre un mensaje estructurado y listo con nombre del modelo, talla, precio y código de referencia.
- **Carrito de Pedidos Múltiples:** Permite añadir varios pares en distintas tallas y generar un pedido consolidado con cálculo automático de totales para enviarlo a WhatsApp.
- **Filtros Avanzados:** Filtrado por categoría, género (Hombre, Mujer, Unisex), rango de tallas (35 a 45), ofertas y buscador en tiempo real.

### 3. ⚙️ Panel de Configuración
- Configura tu número de WhatsApp receptor con código de país.
- Personaliza la moneda (`$`, `€`, `S/.`, `MXN`, `COP`, etc.), nombre de la tienda y eslogan.
- Herramienta para **Exportar e Importar** copias de seguridad de tu catálogo en JSON.
- Soporte opcional para integrar tu propia clave de API de **Google Gemini 1.5 Flash Vision** para análisis multimodal avanzado en la nube.

---

## 🚀 Acceso y Uso

El servidor local ya se encuentra en ejecución:
- **Desde esta computadora:** [http://localhost:5173/](http://localhost:5173/)
- **Desde tu teléfono móvil (conectado a la misma red Wi-Fi):** `http://192.168.1.66:5173/` (o la IP local mostrada en tu terminal).

---

## 🛠️ Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev -- --host

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview
```
