from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import db


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)

    # Libera acesso do frontend (arquivos estáticos abertos via file://
    # ou servidos por live-server/http.server em outra porta) para a API.
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from app.routes.auth_routes import auth_bp
    from app.routes.itens_routes import itens_bp
    from app.routes.propostas_routes import propostas_bp
    from app.routes.historico_routes import historico_bp
    from app.routes.dashboard_routes import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(itens_bp, url_prefix="/api")
    app.register_blueprint(propostas_bp, url_prefix="/api")
    app.register_blueprint(historico_bp, url_prefix="/api")
    app.register_blueprint(dashboard_bp, url_prefix="/api")

    @app.get("/api/status")
    def status():
        return jsonify({"status": "ok", "servico": "TrocaTroca API"}), 200

    @app.errorhandler(404)
    def nao_encontrado(erro):
        return jsonify({"erro": "Rota não encontrada."}), 404

    @app.errorhandler(405)
    def metodo_nao_permitido(erro):
        return jsonify({"erro": "Método não permitido para esta rota."}), 405

    @app.errorhandler(500)
    def erro_interno(erro):
        db.session.rollback()
        return jsonify({"erro": "Erro interno do servidor."}), 500

    with app.app_context():
        db.create_all()

    return app
