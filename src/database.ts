import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

console.log("SUPABASE_URL:", supabaseUrl);
console.log(
    "SECRET KEY CONFIGURADA:",
    !!supabaseSecretKey
);
console.log(
    "PREFIXO DA CHAVE:",
    supabaseSecretKey?.substring(0, 10)
);

if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
        "As variáveis do Supabase não foram configuradas."
    );
}

const db = createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    }
);

export default db;