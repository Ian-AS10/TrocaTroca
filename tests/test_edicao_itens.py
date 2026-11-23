"""Execute com python -m pytest; usa SQLite em memória."""
from datetime import timedelta

import pytest

from app import create_app
from app.auth import gerar_token
from app.extensions import db
from app.models import Item, Usuario


class ConfigTeste:
    TESTING = True
    SECRET_KEY = "chave-exclusiva-para-testes"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXPIRATION = timedelta(hours=1)


@pytest.fixture
def contexto():
    app = create_app(ConfigTeste)
    with app.app_context():
        usuario = Usuario(nome="Pessoa", email="teste@example.com", senha_hash="teste")
        db.session.add(usuario)
        db.session.flush()
        item = Item(nome="Livro", categoria="Livros", estado="Bom", descricao="Descrição", proprietario_id=usuario.id)
        db.session.add(item)
        db.session.commit()
        yield app.test_client(), item.id, {"Authorization": f"Bearer {gerar_token(usuario)}"}
        db.session.remove()
        db.drop_all()


@pytest.mark.parametrize("dados", [
    {"nome": "  "}, {"nome": 42}, {"nome": None},
    {"nome": "Novo nome", "categoria": "Inválida"},
    {"estado": "Inválido"}, ["valor"],
])
def test_edicao_invalida_nao_altera_item(contexto, dados):
    client, item_id, headers = contexto
    resposta = client.put(f"/api/itens/{item_id}", json=dados, headers=headers)
    assert resposta.status_code == 400
    item = client.get(f"/api/itens/{item_id}").get_json()
    assert item["nome"] == "Livro"
    assert item["categoria"] == "Livros"
    assert item["estado"] == "Bom"


def test_edicao_parcial_valida_remove_espacos(contexto):
    client, item_id, headers = contexto
    resposta = client.put(f"/api/itens/{item_id}", json={"nome": "  Novo livro  "}, headers=headers)
    assert resposta.status_code == 200
    assert resposta.get_json()["nome"] == "Novo livro"
    assert resposta.get_json()["categoria"] == "Livros"


def test_outra_pessoa_nao_pode_editar(contexto):
    client, item_id, _ = contexto
    usuario = Usuario(nome="Outra pessoa", email="outro@example.com", senha_hash="teste")
    db.session.add(usuario)
    db.session.commit()
    headers = {"Authorization": f"Bearer {gerar_token(usuario)}"}
    assert client.put(f"/api/itens/{item_id}", json={"nome": "Outro"}, headers=headers).status_code == 403
