const loginForm = document.getElementById("loginForm");

const loginMessage = document.getElementById("loginMessage");


loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();


    const senha =
        document.getElementById("senha").value;


    if (!email || !senha) {

        loginMessage.innerHTML =
            `<div class="message error">
                Preencha todos os campos.
            </div>`;

        return;

    }


    /*
     * Por enquanto estamos simulando o login.
     * Depois vamos conectar com a API do backend.
     */


    if (email === "teste@email.com" && senha === "123456") {

        localStorage.setItem(
            "usuarioLogado",
            "true"
        );


        loginMessage.innerHTML =
            `<div class="message success">
                Login realizado com sucesso!
            </div>`;


        setTimeout(function() {

            window.location.href =
                "dashboard.html";

        }, 800);


    } else {

        loginMessage.innerHTML =
            `<div class="message error">
                E-mail ou senha incorretos.
                <br>
                Teste: teste@email.com / 123456
            </div>`;

    }

});