// ========================================
// VERIFICAR LOGIN
// ========================================

async function verificarLogin() {

    try {

        const resposta =
            await fetch("/admin/verificar");

        if (!resposta.ok) {

            window.location.href =
                "/admin-login.html";

            return false;
        }

        return true;

    } catch (erro) {

        console.error(
            "Erro ao verificar login:",
            erro
        );

        window.location.href =
            "/admin-login.html";

        return false;
    }
}


// ========================================
// CARREGAR CONFIRMAÇÕES
// ========================================

async function carregarConfirmacoes() {

    try {

        const resposta =
            await fetch("/confirmacoes");

        if (!resposta.ok) {

            window.location.href =
                "/admin-login.html";

            return;
        }

        const confirmacoes =
            await resposta.json();

        const tabela =
            document.getElementById(
                "tabelaConfirmacoes"
            );

        tabela.innerHTML = "";


        // Se não houver confirmações

        if (confirmacoes.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        class="sem-confirmacoes"
                    >
                        Nenhuma confirmação ainda.
                    </td>
                </tr>
            `;

        } else {

            confirmacoes.forEach(
                (confirmacao) => {

                    const linha =
                        document.createElement("tr");

                    linha.innerHTML = `
                        <td>
                            <strong>
                                ${confirmacao.nome}
                            </strong>
                        </td>

                        <td>
                            ${confirmacao.pessoas}
                        </td>

                        <td>
                            ${formatarData(
                                confirmacao.criado_em
                            )}
                        </td>

                        <td>

                            <button
                                class="botao-excluir"
                                onclick="excluirConfirmacao(${confirmacao.id})"
                            >
                                Excluir
                            </button>

                        </td>
                    `;

                    tabela.appendChild(linha);
                }
            );
        }


        // Atualiza quantidade de confirmações

        document.getElementById(
            "totalConfirmacoes"
        ).textContent =
            confirmacoes.length;


        // Atualiza total de pessoas

        carregarTotal();

    } catch (erro) {

        console.error(
            "Erro ao carregar confirmações:",
            erro
        );
    }
}


// ========================================
// CARREGAR TOTAL DE PESSOAS
// ========================================

async function carregarTotal() {

    try {

        const resposta =
            await fetch(
                "/confirmacoes/total"
            );

        if (!resposta.ok) {
            return;
        }

        const dados =
            await resposta.json();

        document.getElementById(
            "totalPessoas"
        ).textContent =
            dados.total;

    } catch (erro) {

        console.error(
            "Erro ao carregar total:",
            erro
        );
    }
}


// ========================================
// EXCLUIR CONFIRMAÇÃO
// ========================================

async function excluirConfirmacao(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja remover esta confirmação?"
        );

    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                `/confirmacoes/${id}`,
                {
                    method: "DELETE"
                }
            );


        const dados =
            await resposta.json();


        if (resposta.ok) {

            alert(
                "Confirmação removida com sucesso!"
            );

            carregarConfirmacoes();

        } else {

            alert(
                dados.mensagem ||
                "Não foi possível remover."
            );
        }

    } catch (erro) {

        console.error(
            "Erro ao excluir:",
            erro
        );

        alert(
            "Erro ao conectar com o servidor."
        );
    }
}


// ========================================
// FORMATAR DATA
// ========================================

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const dataFormatada =
        new Date(data);

    return dataFormatada.toLocaleString(
        "pt-BR"
    );
}


// ========================================
// BOTÃO SAIR
// ========================================

document
    .getElementById("botaoSair")
    .addEventListener(
        "click",
        async () => {

            await fetch(
                "/admin/logout",
                {
                    method: "POST"
                }
            );

            window.location.href =
                "/admin-login.html";
        }
    );


// ========================================
// INICIAR PAINEL
// ========================================

async function iniciar() {

    const autenticado =
        await verificarLogin();

    if (autenticado) {

        carregarConfirmacoes();
    }
}

iniciar();