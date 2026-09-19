import Database from "better-sqlite3";

const db = new Database("confirmacoes.db");

// Cria a tabela caso ela ainda não exista
db.exec(`
    CREATE TABLE IF NOT EXISTS confirmacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        pessoas INTEGER NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

export default db;