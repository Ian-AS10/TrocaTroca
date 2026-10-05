const API_URL = "http://localhost:5000/api";
const AUTH_TOKEN_KEY = "authToken";


async function apiRequest(endpoint, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    let response;
    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                "Não foi possível conectar à API. Verifique se o servidor está ativo."
            );
        }
        throw error;
    }

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        throw new Error(
            (data && (data.erro || data.message)) ||
            `A API retornou um erro (${response.status}).`
        );
    }

    return data;
}
