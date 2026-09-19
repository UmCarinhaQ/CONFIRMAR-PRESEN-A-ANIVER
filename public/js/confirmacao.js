// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

const formulario =
    document.getElementById("formConfirmacao");

const mensagem =
    document.getElementById("mensagem");


// ========================================
// ENVIO DA CONFIRMAÇÃO
// ========================================

formulario.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // ========================================
        // PEGAR OS VALORES
        // ========================================

        const nome =
            document
                .getElementById("nome")
                .value
                .trim();


        const pessoas =
            Number(
                document
                    .getElementById("pessoas")
                    .value
            );


        // ========================================
        // VALIDAR NOME
        // ========================================

        if (!nome) {

            mensagem.textContent =
                "Digite seu nome.";

            return;
        }


        // ========================================
        // VALIDAR QUANTIDADE
        // ========================================

        if (
            isNaN(pessoas) ||
            pessoas < 0
        ) {

            mensagem.textContent =
                "Digite uma quantidade válida de pessoas.";

            return;
        }


        // ========================================
        // ENVIAR PARA O SERVIDOR
        // ========================================

        try {

            mensagem.textContent =
                "Enviando confirmação...";


            const resposta =
                await fetch(
                    "/confirmacoes",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            nome: nome,
                            pessoas: pessoas
                        })
                    }
                );


            const dados =
                await resposta.json();


            // ========================================
            // VERIFICAR RESPOSTA
            // ========================================

            if (!resposta.ok) {

                mensagem.textContent =
                    dados.mensagem ||
                    "Erro ao confirmar presença.";

                return;
            }


            // ========================================
            // SUCESSO
            // ========================================

            mensagem.textContent =
                dados.mensagem;


            formulario.reset();

        } catch (erro) {

            console.error(
                "Erro ao confirmar:",
                erro
            );


            mensagem.textContent =
                "Erro ao conectar com o servidor.";
        }

    }
);