const cadastroForm =
    document.getElementById("cadastroForm");


const cadastroMessage =
    document.getElementById("cadastroMessage");


cadastroForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const nome =
            document.getElementById("nome").value.trim();


        const email =
            document.getElementById("email").value.trim();


        const senha =
            document.getElementById("senha").value;


        const confirmarSenha =
            document.getElementById(
                "confirmarSenha"
            ).value;


        if (
            !nome ||
            !email ||
            !senha ||
            !confirmarSenha
        ) {

            mostrarMensagem(
                "Preencha todos os campos.",
                "error"
            );

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

            mostrarMensagem(
                "As senhas não conferem.",
                "error"
            );

            return;

        }


        /*
         * Futuramente:
         *
         * apiRequest("/usuarios", {
         *     method: "POST",
         *     body: JSON.stringify({
         *         nome,
         *         email,
         *         senha
         *     })
         * });
         */


        mostrarMensagem(
            "Cadastro realizado com sucesso!",
            "success"
        );


        setTimeout(function() {

            window.location.href =
                "login.html";

        }, 1200);

    }
);


function mostrarMensagem(texto, tipo) {

    cadastroMessage.innerHTML =
        `<div class="message ${tipo}">
            ${texto}
        </div>`;

}