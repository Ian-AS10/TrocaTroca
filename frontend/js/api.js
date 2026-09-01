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

    }


    return await response.json();

}