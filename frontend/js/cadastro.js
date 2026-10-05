const cadastroForm = document.getElementById("cadastroForm");
const cadastroMessage = document.getElementById("cadastroMessage");

cadastroForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;
    const submitButton = cadastroForm.querySelector('button[type="submit"]');

    if (!nome || !email || !senha || !confirmarSenha) {
        mostrarMensagem("Preencha todos os campos.", "error");
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem(
            "A senha deve possuir pelo menos 6 caracteres.",
            "error"
        );
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarMensagem("As senhas não conferem.", "error");
        return;
    }

    submitButton.disabled = true;
    mostrarMensagem("Criando sua conta...", "pending");

    try {
        await apiRequest("/usuarios", {
            method: "POST",
            body: JSON.stringify({ nome, email, senha })
        });

        mostrarMensagem(
            "Cadastro realizado com sucesso! Redirecionando para o login...",
            "success"
        );

        setTimeout(function() {
            window.location.href = "login.html";
        }, 1200);
    } catch (error) {
        mostrarMensagem(error.message, "error");
        submitButton.disabled = false;
    }
});

function mostrarMensagem(texto, tipo) {
    const mensagem = document.createElement("div");
    mensagem.className = `message ${tipo}`;
    mensagem.setAttribute("role", tipo === "error" ? "alert" : "status");
    mensagem.textContent = texto;
    cadastroMessage.replaceChildren(mensagem);
}
