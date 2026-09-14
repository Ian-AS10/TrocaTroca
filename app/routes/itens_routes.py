from flask import Blueprint, jsonify, request

from app.auth import login_obrigatorio
from app.extensions import db
from app.models import ICONES_POR_CATEGORIA, Item

itens_bp = Blueprint("itens", __name__)

CATEGORIAS_VALIDAS = {"Livros", "Eletrônicos", "Roupas", "Jogos", "Outros"}
ESTADOS_VALIDOS = {"Novo", "Excelente", "Bom", "Regular"}


@itens_bp.get("/itens")
def listar_itens():
    """Lista itens disponíveis (tela itens.html), com busca e filtro opcionais.

    Query params:
      - busca: filtra pelo nome do item (case-insensitive)
      - categoria: filtra por categoria exata
    """
    query = Item.query.filter_by(status="Disponível")

    busca = request.args.get("busca", "").strip()
    if busca:
        query = query.filter(Item.nome.ilike(f"%{busca}%"))

    categoria = request.args.get("categoria", "").strip()
    if categoria:
        query = query.filter_by(categoria=categoria)

    itens = query.order_by(Item.criado_em.desc()).all()
    return jsonify([item.to_dict() for item in itens]), 200


@itens_bp.get("/itens/meus")
@login_obrigatorio
def listar_meus_itens():
    """Lista todos os itens (qualquer status) do usuário autenticado."""
    itens = (
        Item.query.filter_by(proprietario_id=request.usuario_atual.id)
        .order_by(Item.criado_em.desc())
        .all()
    )
    return jsonify([item.to_dict() for item in itens]), 200


@itens_bp.get("/itens/<int:item_id>")
def detalhe_item(item_id):
    """Detalhe de um item (tela detalhe-item.html)."""
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"erro": "Item não encontrado."}), 404
    return jsonify(item.to_dict()), 200


@itens_bp.post("/itens")
@login_obrigatorio
def cadastrar_item():
    """Cadastra um novo item para troca (tela cadastrar-item.html)."""
    dados = request.get_json(silent=True) or {}

    nome = (dados.get("nome") or "").strip()
    categoria = (dados.get("categoria") or "").strip()
    estado = (dados.get("estado") or "").strip()
    descricao = (dados.get("descricao") or "").strip()
    icone = (dados.get("icone") or "").strip()

    if not nome or not categoria or not estado or not descricao:
        return jsonify({"erro": "Preencha todos os campos."}), 400

    if categoria not in CATEGORIAS_VALIDAS:
        return jsonify({"erro": f"Categoria inválida. Use uma de: {', '.join(sorted(CATEGORIAS_VALIDAS))}."}), 400

    if estado not in ESTADOS_VALIDOS:
        return jsonify({"erro": f"Estado inválido. Use um de: {', '.join(sorted(ESTADOS_VALIDOS))}."}), 400

    if not icone:
        icone = ICONES_POR_CATEGORIA.get(categoria, "📦")

    item = Item(
        nome=nome,
        categoria=categoria,
        estado=estado,
        descricao=descricao,
        icone=icone,
        status="Disponível",
        proprietario_id=request.usuario_atual.id,
    )

    db.session.add(item)
    db.session.commit()

    return jsonify(item.to_dict()), 201


@itens_bp.put("/itens/<int:item_id>")
@login_obrigatorio
def atualizar_item(item_id):
    """Atualiza um item. Somente o dono pode editar."""
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"erro": "Item não encontrado."}), 404

    if item.proprietario_id != request.usuario_atual.id:
        return jsonify({"erro": "Você não tem permissão para editar este item."}), 403

    dados = request.get_json(silent=True) or {}

    for campo in ("nome", "categoria", "estado", "descricao", "icone"):
        if campo in dados and dados[campo]:
            setattr(item, campo, dados[campo].strip())

    db.session.commit()
    return jsonify(item.to_dict()), 200


@itens_bp.delete("/itens/<int:item_id>")
@login_obrigatorio
def remover_item(item_id):
    """Remove um item. Somente o dono pode remover, e apenas se disponível."""
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"erro": "Item não encontrado."}), 404

    if item.proprietario_id != request.usuario_atual.id:
        return jsonify({"erro": "Você não tem permissão para remover este item."}), 403

    if item.status != "Disponível":
        return jsonify({"erro": "Não é possível remover um item envolvido em uma troca."}), 400

    db.session.delete(item)
    db.session.commit()
    return jsonify({"mensagem": "Item removido com sucesso."}), 200
