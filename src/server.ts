import express from "express";
import path from "path";
import session from "express-session";
import "dotenv/config";

import db from "./database";

type SessaoAdmin = session.Session & {
    admin?: boolean;
};

const app = express();

const PORT = 3000;

app.use(express.json());

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

app.use(
    express.static(
        path.join(
            __dirname,
            "../public"
        )
    )
);

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../public/index.html"
        )
    );

});


// =====================================
// LOGIN ADMINISTRATIVO
// =====================================

app.post(
    "/admin/login",
    (req, res) => {

        const {
            usuario,
            senha
        } = req.body;

        const usuarioCorreto =
            process.env.ADMIN_USER;

        const senhaCorreta =
            process.env.ADMIN_PASSWORD;

        if (
            usuario === usuarioCorreto &&
            senha === senhaCorreta
        ) {

            (
                req.session as SessaoAdmin
            ).admin = true;

            return res.json({
                sucesso: true,
                mensagem:
                    "Login realizado com sucesso!"
            });

        }

        return res
            .status(401)
            .json({
                sucesso: false,
                mensagem:
                    "Usuário ou senha incorretos."
            });

    }
);


// =====================================
// VERIFICAR LOGIN
// =====================================

app.get(
    "/admin/verificar",
    (req, res) => {

        if (
            (req.session as SessaoAdmin)
                .admin
        ) {

            return res.json({
                autenticado: true
            });

        }

        return res
            .status(401)
            .json({
                autenticado: false
            });

    }
);


// =====================================
// LOGOUT
// =====================================

app.post(
    "/admin/logout",
    (req, res) => {

        req.session.destroy(
            (erro) => {

                if (erro) {

                    return res
                        .status(500)
                        .json({
                            mensagem:
                                "Erro ao sair."
                        });

                }

                return res.json({
                    mensagem:
                        "Logout realizado."
                });

            }
        );

    }
);


// =====================================
// VERIFICAR ADMIN
// =====================================

function verificarAdmin(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {

    if (
        !(req.session as SessaoAdmin)
            .admin
    ) {

        return res
            .status(401)
            .json({
                mensagem:
                    "Acesso não autorizado."
            });

    }

    next();

}


// =====================================
// CRIAR CONFIRMAÇÃO
// =====================================

app.post(
    "/confirmacoes",
    async (req, res) => {

        try {

            const {
                nome,
                pessoas
            } = req.body;

            if (
                !nome ||
                pessoas === undefined
            ) {

                return res
                    .status(400)
                    .json({
                        mensagem:
                            "Preencha todos os campos."
                    });

            }

            if (
                typeof nome !== "string" ||
                nome.trim().length === 0
            ) {

                return res
                    .status(400)
                    .json({
                        mensagem:
                            "Nome inválido."
                    });

            }

            if (
                typeof pessoas !== "number" ||
                pessoas < 0 ||
                !Number.isInteger(pessoas)
            ) {

                return res
                    .status(400)
                    .json({
                        mensagem:
                            "Quantidade de acompanhantes inválida."
                    });

            }

            const {
                data,
                error
            } = await db
                .from("confirmacoes")
                .insert({
                    nome: nome.trim(),
                    pessoas: pessoas
                })
                .select()
                .single();

            if (error) {

                console.error(
                    "ERRO COMPLETO DO SUPABASE:"
                );

                console.error(
                    JSON.stringify(
                        error,
                        null,
                        2
                    )
                );

                return res
                    .status(500)
                    .json({
                        mensagem:
                            "Erro ao salvar confirmação: " +
                            error.message
                    });

            }

            console.log(
                "Confirmação salva:",
                data
            );

            return res.json({
                sucesso: true,
                mensagem:
                    "Presença confirmada com sucesso! 🎉"
            });

        } catch (erro) {

            console.error(
                "ERRO INTERNO:",
                erro
            );

            return res
                .status(500)
                .json({
                    mensagem:
                        "Erro interno do servidor."
                });

        }

    }
);


// =====================================
// LISTAR CONFIRMAÇÕES
// =====================================

app.get(
    "/confirmacoes",
    verificarAdmin,
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await db
                .from("confirmacoes")
                .select("*")
                .order(
                    "id",
                    {
                        ascending: false
                    }
                );

            if (error) {

                console.error(
                    "Erro ao buscar confirmações:",
                    error
                );

                return res
                    .status(500)
                    .json({
                        mensagem:
                            "Erro ao buscar confirmações."
                    });

            }

            return res.json(
                data || []
            );

        } catch (erro) {

            console.error(
                "Erro interno:",
                erro
            );

            return res
                .status(500)
                .json({
                    mensagem:
                        "Erro interno do servidor."
                });

        }

    }
);


// =====================================
// TOTAL DE PESSOAS
// =====================================

app.get(
    "/confirmacoes/total",
    verificarAdmin,
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await db
                .from("confirmacoes")
                .select("pessoas");

            if (error) {

                console.error(
                    "Erro ao calcular total:",
                    error
                );

                return res
                    .status(500)
                    .json({
                        mensagem:
                            "Erro ao calcular total."
                    });

            }

            let total = 0;

            if (data) {

                data.forEach(
                    (confirmacao) => {

                        total +=
                            1 +
                            confirmacao.pessoas;

                    }
                );

            }

            return res.json({
                total: total
            });

        } catch (erro) {

            console.error(
                "Erro interno:",
                erro
            );

            return res
                .status(500)
                .json({
                    mensagem:
                        "Erro interno do servidor."
                });

        }

    }
);


// =====================================
// EXCLUIR CONFIRMAÇÃO
// =====================================

app.delete(
    "/confirmacoes/:id",
    verificarAdmin,
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );

            if (
                isNaN(id)
            ) {

                return res
                    .status(400)
                    .json({
                        mensagem:
                            "ID inválido."
                    });

            }

            const {
                error
            } = await db
                .from("confirmacoes")
                .delete()
                .eq(
                    "id",
                    id
                );

            if (error) {

                console.error(
                    "Erro ao excluir:",
                    error
                );

                return res
                    .status(500)
                    .json({
                        mensagem:
                            "Erro ao excluir confirmação."
                    });

            }

            return res.json({
                mensagem:
                    "Confirmação excluída."
            });

        } catch (erro) {

            console.error(
                "Erro interno:",
                erro
            );

            return res
                .status(500)
                .json({
                    mensagem:
                        "Erro interno do servidor."
                });

        }

    }
);


// =====================================
// INICIAR SERVIDOR
// =====================================

app.listen(
    PORT,
    () => {

        console.log(
            `Servidor rodando em http://localhost:${PORT}`
        );

    }
);