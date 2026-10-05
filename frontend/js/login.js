const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (!email || !senha) {
        mostrarMensagem("Preencha todos os campos.", "error");
        return;
    }

    submitButton.disabled = true;
    mostrarMensagem("Validando seus dados...", "pending");

    try {
        const resultado = await apiRequest("/login", {
            method: "POST",
            body: JSON.stringify({ email, senha })
        });

        if (
            !resultado ||
            typeof resultado.token !== "string" ||
            !resultado.usuario ||
            typeof resultado.usuario !== "object"
        ) {
            throw new Error("A API retornou uma resposta de login inválida.");
        }

        localStorage.setItem(AUTH_TOKEN_KEY, resultado.token);
        localStorage.setItem("usuario", JSON.stringify(resultado.usuario));
        mostrarMensagem("Login realizado com sucesso!", "success");

        setTimeout(function() {
            window.location.href = "dashboard.html";
        }, 800);
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
    loginMessage.replaceChildren(mensagem);
}
