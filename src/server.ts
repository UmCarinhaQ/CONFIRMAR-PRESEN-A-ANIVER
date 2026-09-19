import express from "express";
import path from "path";
import session from "express-session";
import "dotenv/config";

import db from "./database";

// ========================================
// TIPAGEM DA SESSÃO
// ========================================

type SessaoAdmin = session.Session & {
    admin?: boolean;
};

// ========================================
// CONFIGURAÇÃO
// ========================================

const app = express();

const PORT = 3000;

// ========================================
// MIDDLEWARES
// ========================================

// Permite receber JSON
app.use(express.json());

// Configuração das sessões
app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "chave-temporaria",

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 4
        }
    })
);

// Permite acessar os arquivos da pasta public
app.use(
    express.static(
        path.join(__dirname, "../public")
    )
);

// ========================================
// PÁGINA PRINCIPAL
// ========================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../public/index.html"
        )
    );
});

// ========================================
// LOGIN ADMIN
// ========================================

app.post("/admin/login", (req, res) => {
    const { usuario, senha } = req.body;

    const usuarioCorreto =
        process.env.ADMIN_USER;

    const senhaCorreta =
        process.env.ADMIN_PASSWORD;

    if (
        usuario === usuarioCorreto &&
        senha === senhaCorreta
    ) {
        (req.session as SessaoAdmin).admin =
            true;

        return res.json({
            sucesso: true,
            mensagem:
                "Login realizado com sucesso!"
        });
    }

    return res.status(401).json({
        sucesso: false,
        mensagem:
            "Usuário ou senha incorretos."
    });
});

// ========================================
// VERIFICAR LOGIN
// ========================================

app.get("/admin/verificar", (req, res) => {
    if (
        (req.session as SessaoAdmin).admin
    ) {
        return res.json({
            autenticado: true
        });
    }

    return res.status(401).json({
        autenticado: false
    });
});

// ========================================
// LOGOUT
// ========================================

app.post("/admin/logout", (req, res) => {
    req.session.destroy((erro) => {
        if (erro) {
            return res.status(500).json({
                mensagem: "Erro ao sair."
            });
        }

        res.json({
            mensagem: "Logout realizado."
        });
    });
});

// ========================================
// MIDDLEWARE ADMIN
// ========================================

function verificarAdmin(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    if (
        !(req.session as SessaoAdmin).admin
    ) {
        return res.status(401).json({
            mensagem:
                "Acesso não autorizado."
        });
    }

    next();
}

// ========================================
// CONFIRMAR PRESENÇA
// ========================================

app.post("/confirmacoes", (req, res) => {
    const { nome, pessoas } = req.body;

    // Verifica se o nome foi preenchido
    if (
        !nome ||
        pessoas === undefined
    ) {
        return res.status(400).json({
            mensagem:
                "Preencha todos os campos."
        });
    }

    // Verifica se a quantidade é válida
    if (
        typeof pessoas !== "number" ||
        pessoas < 0
    ) {
        return res.status(400).json({
            mensagem:
                "Quantidade de pessoas inválida."
        });
    }

    // Comando para salvar no banco
    const comando = db.prepare(`
        INSERT INTO confirmacoes
        (nome, pessoas)
        VALUES (?, ?)
    `);

    comando.run(nome, pessoas);

    res.json({
        mensagem:
            "Presença confirmada com sucesso! 🎉"
    });
});

// ========================================
// LISTAR CONFIRMAÇÕES
// SOMENTE ADMIN
// ========================================

app.get(
    "/confirmacoes",
    verificarAdmin,
    (req, res) => {
        const confirmacoes = db
            .prepare(`
                SELECT *
                FROM confirmacoes
                ORDER BY id DESC
            `)
            .all();

        res.json(confirmacoes);
    }
);

// ========================================
// TOTAL DE PESSOAS
// SOMENTE ADMIN
// ========================================

app.get(
    "/confirmacoes/total",
    verificarAdmin,
    (req, res) => {
        const resultado = db
            .prepare(`
                SELECT SUM(pessoas) AS total
                FROM confirmacoes
            `)
            .get() as {
                total: number | null;
            };

        res.json({
            total: resultado.total ?? 0
        });
    }
);

// ========================================
// EXCLUIR CONFIRMAÇÃO
// SOMENTE ADMIN
// ========================================

app.delete(
    "/confirmacoes/:id",
    verificarAdmin,
    (req, res) => {
        const id = Number(
            req.params.id
        );

        // Verifica se o ID é válido
        if (isNaN(id)) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const comando = db.prepare(`
            DELETE FROM confirmacoes
            WHERE id = ?
        `);

        comando.run(id);

        res.json({
            mensagem:
                "Confirmação excluída."
        });
    }
);

// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );
});