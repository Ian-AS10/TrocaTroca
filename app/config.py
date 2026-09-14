import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


class Config:
    """Configurações da aplicação TrocaTroca."""

    # Chave usada para assinar os tokens JWT. Em produção, defina a
    # variável de ambiente SECRET_KEY com um valor forte e secreto.
    SECRET_KEY = os.environ.get("SECRET_KEY", "troca-troca-chave-super-secreta-dev")

    # Banco de dados SQLite local (arquivo trocatroca.db na raiz do backend)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'trocatroca.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Tempo de validade do token de autenticação
    JWT_EXPIRATION = timedelta(hours=24)

    JSON_SORT_KEYS = False
