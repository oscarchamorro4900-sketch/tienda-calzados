/**
 * Optimiza URLs de imágenes para carga ultrarrápida en dispositivos móviles
 * Reduce drásticamente el peso de las fotos de catálogo sin perder nitidez visual
 * 
 * @param {string} url - URL original de la imagen
 * @param {number} width - Ancho en pixeles (default 420px para grid móvil 2-columnas)
 * @param {number} quality - Calidad de compresión (default 75)
 * @returns {string} URL optimizada
 */
export function optimizeImageUrl(url, width = 420, quality = 75) {
  if (!url || typeof url !== 'string') return url;

  // Si es data:base64, devolver tal cual
  if (url.startsWith('data:')) return url;

  // Optimización de imágenes de Unsplash
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('w', String(width));
      urlObj.searchParams.set('q', String(quality));
      return urlObj.toString();
    } catch (e) {
      return url
        .replace(/w=\d+/, `w=${width}`)
        .replace(/q=\d+/, `q=${quality}`);
    }
  }

  // Optimización de imágenes de Supabase Storage con render/image si está disponible
  if (url.includes('/storage/v1/object/public/')) {
    // Si la instancia de Supabase soporta transformation service:
    // /storage/v1/render/image/public/...
    // Para compatibilidad general lo mantenemos limpio
    return url;
  }

  return url;
}
