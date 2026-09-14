from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db


# Ícone padrão sugerido para cada categoria, usado quando o item é
# cadastrado sem um ícone específico (mesma ideia usada no mock do frontend).
ICONES_POR_CATEGORIA = {
    "Livros": "📚",
    "Eletrônicos": "🎧",
    "Roupas": "👕",
    "Jogos": "🎮",
    "Outros": "📦",
}


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False, index=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)

    itens = db.relationship("Item", backref="proprietario", lazy=True)

    def set_senha(self, senha: str):
        self.senha_hash = generate_password_hash(senha)

    def checar_senha(self, senha: str) -> bool:
        return check_password_hash(self.senha_hash, senha)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "criado_em": self.criado_em.isoformat(),
        }


class Item(db.Model):
    __tablename__ = "itens"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    estado = db.Column(db.String(30), nullable=False)
    descricao = db.Column(db.Text, nullable=False, default="")
    icone = db.Column(db.String(10), nullable=False, default="📦")
    # Disponível | Reservado | Trocado
    status = db.Column(db.String(20), nullable=False, default="Disponível")
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)

    proprietario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)

    def to_dict(self, incluir_proprietario=True):
        data = {
            "id": self.id,
            "nome": self.nome,
            "categoria": self.categoria,
            "estado": self.estado,
            "descricao": self.descricao,
            "icone": self.icone,
            "status": self.status,
            "criado_em": self.criado_em.isoformat(),
            "proprietario_id": self.proprietario_id,
        }
        if incluir_proprietario and self.proprietario:
            data["proprietario_nome"] = self.proprietario.nome
        return data


class Proposta(db.Model):
    __tablename__ = "propostas"

    id = db.Column(db.Integer, primary_key=True)
    # pendente | aceita | recusada | cancelada
    status = db.Column(db.String(20), nullable=False, default="pendente")
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    proponente_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)

    item_oferecido_id = db.Column(db.Integer, db.ForeignKey("itens.id"), nullable=False)
    item_desejado_id = db.Column(db.Integer, db.ForeignKey("itens.id"), nullable=False)

    proponente = db.relationship("Usuario", foreign_keys=[proponente_id])
    item_oferecido = db.relationship("Item", foreign_keys=[item_oferecido_id])
    item_desejado = db.relationship("Item", foreign_keys=[item_desejado_id])

    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status,
            "criado_em": self.criado_em.isoformat(),
            "atualizado_em": self.atualizado_em.isoformat(),
            "proponente": {
                "id": self.proponente.id,
                "nome": self.proponente.nome,
            },
            "item_oferecido": self.item_oferecido.to_dict(incluir_proprietario=False),
            "item_desejado": self.item_desejado.to_dict(incluir_proprietario=False),
            "dono_item_desejado_id": self.item_desejado.proprietario_id,
        }


class Troca(db.Model):
    """Registro de histórico gerado quando uma proposta é aceita."""

    __tablename__ = "trocas"

    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.DateTime, default=datetime.utcnow)

    proposta_id = db.Column(db.Integer, db.ForeignKey("propostas.id"), nullable=False)

    usuario1_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    usuario2_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)

    item1_id = db.Column(db.Integer, db.ForeignKey("itens.id"), nullable=False)
    item2_id = db.Column(db.Integer, db.ForeignKey("itens.id"), nullable=False)

    usuario1 = db.relationship("Usuario", foreign_keys=[usuario1_id])
    usuario2 = db.relationship("Usuario", foreign_keys=[usuario2_id])
    item1 = db.relationship("Item", foreign_keys=[item1_id])
    item2 = db.relationship("Item", foreign_keys=[item2_id])

    def to_dict(self, usuario_atual_id):
        # Mostra sempre "meu item ⇄ item do outro" e o nome do outro usuário,
        # independente de quem era o proponente original.
        if self.usuario1_id == usuario_atual_id:
            meu_item, item_outro = self.item1, self.item2
            outro_usuario = self.usuario2
        else:
            meu_item, item_outro = self.item2, self.item1
            outro_usuario = self.usuario1

        return {
            "id": self.id,
            "data": self.data.isoformat(),
            "meu_item": meu_item.to_dict(incluir_proprietario=False),
            "item_outro": item_outro.to_dict(incluir_proprietario=False),
            "outro_usuario_nome": outro_usuario.nome,
            "status": "Concluída",
        }
