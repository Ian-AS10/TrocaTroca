from flask import Blueprint, jsonify, request

from app.auth import login_obrigatorio
from app.models import Troca

historico_bp = Blueprint("historico", __name__)


@historico_bp.get("/historico")
@login_obrigatorio
def listar_historico():
    """Lista as trocas concluídas do usuário autenticado (tela historico.html)."""
    usuario_id = request.usuario_atual.id

    trocas = (
        Troca.query.filter(
            (Troca.usuario1_id == usuario_id) | (Troca.usuario2_id == usuario_id)
        )
        .order_by(Troca.data.desc())
        .all()
    )

    return jsonify([troca.to_dict(usuario_id) for troca in trocas]), 200
