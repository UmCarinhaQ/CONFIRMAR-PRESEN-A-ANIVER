const formulario =
    document.getElementById("formConfirmacao");

const mensagem =
    document.getElementById("mensagem");

const checkboxSozinho =
    document.getElementById("sozinho");

const campoPessoas =
    document.getElementById("pessoas");


// Quando marcar "Irei sozinho"
checkboxSozinho.addEventListener(
    "change",
    () => {

        if (checkboxSozinho.checked) {

            campoPessoas.value = 0;

            campoPessoas.disabled = true;

        } else {

            campoPessoas.disabled = false;

        }
    }
);


formulario.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const nome =
            document
                .getElementById("nome")
                .value
                .trim();

        const pessoas =
            Number(campoPessoas.value);


        if (!nome) {

            mensagem.textContent =
                "Digite seu nome.";

            return;
        }


        if (
            isNaN(pessoas) ||
            pessoas < 0 ||
            !Number.isInteger(pessoas)
        ) {

            mensagem.textContent =
                "Digite uma quantidade válida de acompanhantes.";

            return;
        }


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


            if (!resposta.ok) {

                mensagem.textContent =
                    dados.mensagem ||
                    "Erro ao confirmar presença.";

                return;
            }


            mensagem.textContent =
                dados.mensagem;


            formulario.reset();

            campoPessoas.disabled = false;

            campoPessoas.value = 0;

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