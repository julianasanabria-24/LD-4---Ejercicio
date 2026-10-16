// 2° Configuración y creación del cliente de Supabase.
// Reemplaza estos valores con los de tu proyecto (Project Settings > API).
const SUPABASE_URL = "https://haseapigywwjyzuxrzbp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhc2VhcGlneXd3anl6dXhyemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODg1MzUsImV4cCI6MjEwNzY2NDUzNX0.C14Pdjl0XqdRYR8kvq5G5552Vi2JGk--YOciWdCxpX8";

// `supabase` es el objeto global que expone la librería cargada desde el CDN.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
