from flask import Flask
from flask_cors import CORS
from config import Config
from db_setup import db
from routes.skills_matrix_routes import skills_matrix_bp
from routes.operator_points_routes import operator_points_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    app.register_blueprint(skills_matrix_bp, url_prefix="/api")
    app.register_blueprint(operator_points_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)