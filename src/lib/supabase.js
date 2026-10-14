import { createClient } from '@supabase/supabase-js';

// Cliente singleton en memoria
let supabaseInstance = null;
let currentUrl = null;
let currentKey = null;

/**
 * Obtiene o inicializa la instancia de Supabase de acuerdo a la configuración actual
 */
export function getSupabase(config = {}) {
  const url = config.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || "";
  const anonKey = config.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || "";

  if (!url || !anonKey || !url.startsWith("http")) {
    return null;
  }

  if (!supabaseInstance || currentUrl !== url || currentKey !== anonKey) {
    currentUrl = url;
    currentKey = anonKey;
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.warn("Error creando cliente de Supabase:", e);
      supabaseInstance = null;
    }
  }

  return supabaseInstance;
}

/**
 * Verifica si Supabase está configurado con datos válidos
 */
export function isCloudConfigured(config = {}) {
  const url = config.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || "";
  const key = config.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  return Boolean(url && key && url.includes(".supabase.co") && key.length > 20);
}

/**
 * Mapeo de columnas de base de datos a formato de objeto calzado
 */
export function mapRowToShoe(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand || "Exclusivo",
    category: row.category || "Deportivo",
    gender: row.gender || "Unisex",
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    discount: row.discount || "",
    rating: row.rating ? Number(row.rating) : 4.9,
    reviewsCount: row.reviews_count || 20,
    sizes: Array.isArray(row.sizes) ? row.sizes : (typeof row.sizes === 'string' ? JSON.parse(row.sizes) : [38, 39, 40, 41]),
    colors: Array.isArray(row.colors) ? row.colors : (typeof row.colors === 'string' ? JSON.parse(row.colors) : ["Estándar"]),
    material: row.material || "",
    description: row.description || "",
    featured: Boolean(row.featured),
    seasonBadge: row.season_badge || "",
    stock: row.stock !== undefined ? Number(row.stock) : 10,
    images: Array.isArray(row.images) ? row.images : (typeof row.images === 'string' ? JSON.parse(row.images) : []),
    isAiAnalyzed: Boolean(row.is_ai_analyzed),
    createdAt: row.created_at
  };
}

/**
 * Mapeo de objeto calzado a fila para Postgres en Supabase
 */
export function mapShoeToRow(shoe) {
  return {
    id: shoe.id,
    name: shoe.name,
    brand: shoe.brand || "Exclusivo",
    category: shoe.category || "Deportivo",
    gender: shoe.gender || "Unisex",
    price: Number(shoe.price),
    original_price: shoe.originalPrice ? Number(shoe.originalPrice) : null,
    discount: shoe.discount || null,
    rating: shoe.rating || 4.9,
    reviews_count: shoe.reviewsCount || 20,
    sizes: shoe.sizes || [],
    colors: shoe.colors || [],
    material: shoe.material || "",
    description: shoe.description || "",
    featured: Boolean(shoe.featured),
    season_badge: shoe.seasonBadge || null,
    stock: shoe.stock !== undefined ? Number(shoe.stock) : 10,
    images: shoe.images || [],
    is_ai_analyzed: Boolean(shoe.isAiAnalyzed)
  };
}

/**
 * Descarga todos los zapatos desde la nube Supabase
 */
export async function fetchShoesFromCloud(config) {
  const client = getSupabase(config);
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('shoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Aviso al consultar Supabase:", error.message);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map(mapRowToShoe);
    }
    return [];
  } catch (err) {
    console.error("Error conectando con Supabase:", err);
    return null;
  }
}

/**
 * Guarda o actualiza un zapato en la nube
 */
export async function saveShoeToCloud(shoe, config) {
  const client = getSupabase(config);
  if (!client) return false;

  try {
    const row = mapShoeToRow(shoe);
    const { error } = await client
      .from('shoes')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error("Error guardando zapato en la nube:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error en upsert a Supabase:", err);
    return false;
  }
}

/**
 * Guarda una lista de zapatos en lote en la nube
 */
export async function saveBatchShoesToCloud(shoesList, config) {
  const client = getSupabase(config);
  if (!client || !shoesList.length) return false;

  try {
    const rows = shoesList.map(mapShoeToRow);
    const { error } = await client
      .from('shoes')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error("Error subiendo lote a Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error en batch upsert:", err);
    return false;
  }
}

/**
 * Elimina un zapato de la nube
 */
export async function deleteShoeFromCloud(shoeId, config) {
  const client = getSupabase(config);
  if (!client) return false;

  try {
    const { error } = await client
      .from('shoes')
      .delete()
      .eq('id', shoeId);

    if (error) {
      console.error("Error borrando zapato de la nube:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error en delete de Supabase:", err);
    return false;
  }
}

/**
 * Subir imagen al Bucket 'shoe-photos' de Supabase Storage
 */
export async function uploadImageToStorage(fileOrBlob, config) {
  const client = getSupabase(config);
  if (!client) return null;

  try {
    const fileExt = (fileOrBlob.name ? fileOrBlob.name.split('.').pop() : 'jpg') || 'jpg';
    const cleanExt = fileExt.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg';
    const fileName = `shoe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
    const filePath = `catalog/${fileName}`;

    const { error: uploadError } = await client.storage
      .from('shoe-photos')
      .upload(filePath, fileOrBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: fileOrBlob.type || 'image/jpeg'
      });

    if (uploadError) {
      console.warn("Storage upload omitido (usando base64 optimizado):", uploadError.message);
      return null;
    }

    const { data } = client.storage.from('shoe-photos').getPublicUrl(filePath);
    return data?.publicUrl || null;
  } catch (e) {
    console.warn("Fallo subida a storage, usando fallback:", e);
    return null;
  }
}

/**
 * Escucha cambios en tiempo real en la tabla de zapatos
 */
export function subscribeToRealtimeShoes(config, onRealtimeEvent) {
  const client = getSupabase(config);
  if (!client) return null;

  try {
    const channel = client
      .channel('public:shoes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shoes' },
        (payload) => {
          onRealtimeEvent(payload);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn("No se pudo iniciar canal Realtime:", err);
    return null;
  }
}

/**
 * Script SQL preparado para copiar y pegar en Supabase SQL Editor
 */
export const SUPABASE_SQL_SCRIPT = `-- ==========================================
-- SCRIPT DE INICIALIZACIÓN DE TABLA Y ALMACENAMIENTO DE ZAPATOS
-- Pega esto en el 'SQL Editor' de tu panel de Supabase y presiona 'RUN'
-- ==========================================

-- 1. Crear tabla de calzados si no existe
CREATE TABLE IF NOT EXISTS public.shoes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  gender TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  discount TEXT,
  rating NUMERIC DEFAULT 4.9,
  reviews_count INTEGER DEFAULT 20,
  sizes JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  material TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT true,
  season_badge TEXT,
  stock INTEGER DEFAULT 10,
  images JSONB DEFAULT '[]'::jsonb,
  is_ai_analyzed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar seguridad de nivel de fila (RLS) con políticas idempotentes
ALTER TABLE public.shoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de zapatos" ON public.shoes;
CREATE POLICY "Lectura pública de zapatos" ON public.shoes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción de zapatos" ON public.shoes;
CREATE POLICY "Inserción de zapatos" ON public.shoes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualización de zapatos" ON public.shoes;
CREATE POLICY "Actualización de zapatos" ON public.shoes
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Eliminación de zapatos" ON public.shoes;
CREATE POLICY "Eliminación de zapatos" ON public.shoes
  FOR DELETE USING (true);

-- 3. Habilitar Realtime para que los cambios se reflejen en vivo en todos los celulares
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'shoes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shoes;
  END IF;
END $$;

-- 4. Crear bucket de Storage público 'shoe-photos' si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shoe-photos', 'shoe-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de acceso para el bucket de fotos
DROP POLICY IF EXISTS "Lectura pública shoe-photos" ON storage.objects;
CREATE POLICY "Lectura pública shoe-photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'shoe-photos');

DROP POLICY IF EXISTS "Subida pública shoe-photos" ON storage.objects;
CREATE POLICY "Subida pública shoe-photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'shoe-photos');

DROP POLICY IF EXISTS "Actualización pública shoe-photos" ON storage.objects;
CREATE POLICY "Actualización pública shoe-photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'shoe-photos');

DROP POLICY IF EXISTS "Borrado público shoe-photos" ON storage.objects;
CREATE POLICY "Borrado público shoe-photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'shoe-photos');
`;
