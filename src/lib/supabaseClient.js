import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Silenciar error de Realtime (// no afecta la funcionalidad)
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('A listener indicated an asynchronous response')) {
    return;
  }
  originalConsoleError(...args);

};
