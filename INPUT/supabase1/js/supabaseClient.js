// 2° Configuración y creación del cliente de Supabase.
// Reemplaza estos valores con los de tu proyecto (Project Settings > API).
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU-ANON-KEY';

// `supabase` es el objeto global que expone la librería cargada desde el CDN.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Alias usado en los ejercicios (prueba.js).
const db = supabaseClient;
