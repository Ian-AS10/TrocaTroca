const API_URL = "http://localhost:5000/api";


async function apiRequest(endpoint, options = {}) {

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            headers: {
                "Content-Type": "application/json"
            },

            ...options
        }
    );


    if (!response.ok) {

        throw new Error(
            `Erro na API: ${response.status}`
        );



        // Verifica se a API do TrocaTroca está disponível
async function verificarStatusAPI() {
    try {
        const response = await fetch(`${API_URL}/status`);

        if (!response.ok) {
            throw new Error(`Status HTTP: ${response.status}`);
        }

        console.log("API TrocaTroca está disponível.");
        return true;
    } catch (error) {
        console.error("API TrocaTroca indisponível:", error.message);
        return false;
    }
}

    }


    return await response.json();

}
