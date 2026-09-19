// ========================================
// ELEMENTOS
// ========================================

const formulario =
    document.getElementById("formLogin");

const mensagem =
    document.getElementById("mensagem");


// ========================================
// LOGIN
// ========================================

formulario.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // ========================================
        // PEGAR DADOS
        // ========================================

        const usuario =
            document
                .getElementById("usuario")
                .value
                .trim();


        const senha =
            document
                .getElementById("senha")
                .value;


        // ========================================
        // ENVIAR LOGIN
        // ========================================

        try {

            const resposta =
                await fetch(
                    "/admin/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            usuario: usuario,
                            senha: senha
                        })
                    }
                );


            const dados =
                await resposta.json();


            // ========================================
            // LOGIN CORRETO
            // ========================================

            if (resposta.ok) {

                window.location.href =
                    "/admin.html";

                return;
            }


            // ========================================
            // LOGIN INCORRETO
            // ========================================

            mensagem.textContent =
                dados.mensagem ||
                "Usuário ou senha incorretos.";

        } catch (erro) {

            console.error(
                "Erro no login:",
                erro
            );


            mensagem.textContent =
                "Erro ao conectar com o servidor.";
        }

    }
);