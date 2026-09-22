import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Reemplaza con tus credenciales de Supabase
const SUPABASE_URL = 'https://ymegydnuzjcdugniluwj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yAbvsk8wmlMmi3gGXxOPEw_5yyVG5vF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
