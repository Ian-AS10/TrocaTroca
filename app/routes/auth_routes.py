from flask import Blueprint, jsonify, request

from app.auth import gerar_token, login_obrigatorio
from app.extensions import db
from app.models import Usuario

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/usuarios")
def cadastrar_usuario():
    """Cria uma nova conta de usuário (tela cadastro.html)."""
    dados = request.get_json(silent=True) or {}

    nome = (dados.get("nome") or "").strip()
    email = (dados.get("email") or "").strip().lower()
    senha = dados.get("senha") or ""

    if not nome or not email or not senha:
        return jsonify({"erro": "Preencha todos os campos."}), 400

    if len(senha) < 6:
        return jsonify({"erro": "A senha deve possuir pelo menos 6 caracteres."}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"erro": "Já existe uma conta cadastrada com este e-mail."}), 409

    usuario = Usuario(nome=nome, email=email)
    usuario.set_senha(senha)

    db.session.add(usuario)
    db.session.commit()

    return jsonify(usuario.to_dict()), 201


@auth_bp.post("/login")
def login():
    """Autentica o usuário e devolve um token JWT (tela login.html)."""
    dados = request.get_json(silent=True) or {}

    email = (dados.get("email") or "").strip().lower()
    senha = dados.get("senha") or ""

    if not email or not senha:
        return jsonify({"erro": "Preencha todos os campos."}), 400

    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario or not usuario.checar_senha(senha):
        return jsonify({"erro": "E-mail ou senha incorretos."}), 401

    token = gerar_token(usuario)

    return jsonify({"token": token, "usuario": usuario.to_dict()}), 200


@auth_bp.get("/usuarios/me")
@login_obrigatorio
def usuario_atual():
    """Retorna os dados do usuário autenticado."""
    return jsonify(request.usuario_atual.to_dict()), 200
