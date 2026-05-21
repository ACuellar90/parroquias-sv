// ============================================================
// CONFIGURACIÓN — reemplazá estos valores con los de Supabase
// ============================================================
const SUPABASE_URL = 'https://nynwwdijeqenblruqbgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bnd3ZGlqZXFlbmJscnVxYmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDM1NTEsImV4cCI6MjA5NDg3OTU1MX0.ckkt5PaJOEGdJYF3MtJ22lLwsJYu2kkhbXIpDAtO6UA';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
