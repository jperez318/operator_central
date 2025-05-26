from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Operator, Training, TrainingStatus

app = Flask(__name__)
CORS(app)

# 🔧 Use PostgreSQL from the start
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Jp072303#@localhost/operator_training'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route("/")
def index():
    return "Backend is running!"
@app.route("/operators", methods=["GET"])
def get_operators():
    ops = Operator.query.all()
    return jsonify([{"id": op.id, "name": op.name} for op in ops])

@app.route("/operators", methods=["POST"])
def add_operator():
    data = request.json
    op = Operator(name=data["name"])
    db.session.add(op)
    db.session.commit()
    return jsonify({"id": op.id, "name": op.name})

@app.route("/operators/<int:id>", methods=["DELETE"])
def delete_operator(id):
    op = Operator.query.get_or_404(id)
    db.session.delete(op)
    db.session.commit()
    return jsonify({"message": "Deleted"})

if __name__ == "__main__":
    app.run(debug=True)
