import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Reemplaza con tus credenciales de Supabase
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-clave-anonima-publica';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
