from datetime import datetime, timezone
from functools import wraps

import jwt
from flask import current_app, jsonify, request

from app.models import Usuario


def gerar_token(usuario: Usuario) -> str:
    payload = {
        "sub": usuario.id,
        "email": usuario.email,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + current_app.config["JWT_EXPIRATION"],
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def _extrair_token():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return None


def login_obrigatorio(func):
    """Decorator que exige um token JWT válido no header Authorization.

    Em caso de sucesso, injeta o usuário autenticado em request.usuario_atual.
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        token = _extrair_token()

        if not token:
            return jsonify({"erro": "Token de autenticação não informado."}), 401

        try:
            payload = jwt.decode(
                token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
            )
        except jwt.ExpiredSignatureError:
            return jsonify({"erro": "Token expirado. Faça login novamente."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"erro": "Token inválido."}), 401

        usuario = Usuario.query.get(payload.get("sub"))
        if not usuario:
            return jsonify({"erro": "Usuário não encontrado."}), 401

        request.usuario_atual = usuario
        return func(*args, **kwargs)

    return wrapper
