from flask import Blueprint, jsonify, request

from app.auth import login_obrigatorio
from app.models import Item, Proposta, Troca

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/dashboard")
@login_obrigatorio
def dashboard():
    """Estatísticas exibidas nos cards do dashboard.html."""
    usuario_id = request.usuario_atual.id

    meus_itens = Item.query.filter_by(proprietario_id=usuario_id).count()

    propostas_enviadas = Proposta.query.filter_by(
        proponente_id=usuario_id, status="pendente"
    ).count()

    propostas_recebidas = (
        Proposta.query.join(Item, Proposta.item_desejado_id == Item.id)
        .filter(Item.proprietario_id == usuario_id, Proposta.status == "pendente")
        .count()
    )

    trocas_realizadas = Troca.query.filter(
        (Troca.usuario1_id == usuario_id) | (Troca.usuario2_id == usuario_id)
    ).count()

    return (
        jsonify(
            {
                "meus_itens": meus_itens,
                "propostas_enviadas": propostas_enviadas,
                "propostas_recebidas": propostas_recebidas,
                "trocas_realizadas": trocas_realizadas,
                "usuario": request.usuario_atual.to_dict(),
            }
        ),
        200,
    )
