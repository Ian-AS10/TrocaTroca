"""
Popula o banco com dados de exemplo equivalentes aos que já estavam
mockados no frontend (frontend/js/itens.js e o login de teste do
frontend/js/login.js), para facilitar os testes manuais.

Uso:
    python seed.py
"""

from app import create_app
from app.extensions import db
from app.models import Item, Usuario

app = create_app()

ITENS_EXEMPLO = [
    dict(nome="Harry Potter e a Pedra Filosofal", categoria="Livros",
         estado="Bom", icone="📚", descricao="Livro usado em bom estado."),
    dict(nome="Controle para videogame", categoria="Eletrônicos",
         estado="Excelente", icone="🎮", descricao="Controle funcionando perfeitamente."),
    dict(nome="Camiseta preta", categoria="Roupas",
         estado="Bom", icone="👕", descricao="Camiseta preta tamanho M."),
    dict(nome="FIFA 24", categoria="Jogos",
         estado="Excelente", icone="🎮", descricao="Jogo original em excelente estado."),
    dict(nome="Livro O Hobbit", categoria="Livros",
         estado="Bom", icone="📖", descricao="Livro em bom estado de conservação."),
    dict(nome="Fone Bluetooth", categoria="Eletrônicos",
         estado="Bom", icone="🎧", descricao="Fone Bluetooth funcionando normalmente."),
]

with app.app_context():
    db.create_all()

    # Usuário de teste, igual ao que era simulado em login.js
    usuario = Usuario.query.filter_by(email="teste@email.com").first()
    if not usuario:
        usuario = Usuario(nome="Usuário Teste", email="teste@email.com")
        usuario.set_senha("123456")
        db.session.add(usuario)
        db.session.commit()
        print("Usuário de teste criado: teste@email.com / 123456")
    else:
        print("Usuário de teste já existe.")

    if Item.query.count() == 0:
        for dados in ITENS_EXEMPLO:
            item = Item(status="Disponível", proprietario_id=usuario.id, **dados)
            db.session.add(item)
        db.session.commit()
        print(f"{len(ITENS_EXEMPLO)} itens de exemplo cadastrados.")
    else:
        print("Já existem itens cadastrados, nenhum item de exemplo foi adicionado.")

    print("Seed concluído.")
