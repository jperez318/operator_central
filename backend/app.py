from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from db_setup import db
from routes.skills_matrix_routes import skills_matrix_bp
from routes.operator_points_routes import operator_points_bp
import os

def create_app():
    app = Flask(
        __name__,
        static_folder="static",
        static_url_path="/"
    )

    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)

    app.register_blueprint(skills_matrix_bp, url_prefix="/api")
    app.register_blueprint(operator_points_bp, url_prefix="/api")

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_react(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, "index.html")

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)