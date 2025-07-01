from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Operator, Training, TrainingStatus

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Jp072303#@localhost/operator_training'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route("/")
def index():
    return "Backend is running!"

@app.route("/operators", methods=["GET"])
def get_operators():
    training_id = request.args.get("training_id", type=int)

    results = []
    for op in Operator.query.all():
        status_record = TrainingStatus.query.filter_by(operator_id=op.id, training_id=training_id).first()
        results.append({
            "id": op.id,
            "name": op.name,
            "status": status_record.status if status_record else None
        })

    return jsonify(results)

@app.route("/operators", methods=["POST"])
def add_operator():
    data = request.json
    op = Operator(name=data["name"])
    db.session.add(op)
    db.session.commit()

    trainings = Training.query.all()
    if not trainings:
        default_training = Training(name="Default Training")
        db.session.add(default_training)
        db.session.commit()
        trainings = [default_training]

    for t in trainings:
        training_status = TrainingStatus(
            operator_id=op.id, training_id = t.id, status="not_trained"
        )
        db.session.add(training_status)
    db.session.commit()

    return jsonify({
        "id": op.id,
        "name": op.name,
        "status": "not_trained"
    })


@app.route("/operators", methods=["DELETE"])
def delete_operator():
    name = request.args.get("name")
    if not name:
        return jsonify({"error": "A name is Required"}), 400
    operators = Operator.query.filter(Operator.name == name).all()
    if not operators:
        return jsonify({"error": "There are no operators with that name"}), 404
    for op in operators:
        db.session.delete(op)
    db.session.commit()
    return jsonify({"message": f"Deleted operator(s) with name {name}"})


@app.route("/trainings", methods=["POST"])
def add_training():
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"error": "Name is required"}), 400
    
    training = Training(name=name)
    db.session.add(training)
    db.session.commit()

    operators = Operator.query.all()
    if not operators: return
    for op in operators:
        new_status = TrainingStatus(operator_id=op.id, training_id=training.id, status= "not_trained")
        db.session.add(new_status)
    db.session.commit()

    return jsonify({"id": training.id, "name": training.name})  

@app.route("/trainings", methods=["DELETE"])
def delete_training():
    name = request.args.get("name")
    if not name:
        return jsonify({"error": "A name is Required"}), 400
    training = Training.query.filter(Training.name == name).all()
    if not training:
        return jsonify({"error": "There are no training with that name"}), 404
    for t in training:
        db.session.delete(t)
    db.session.commit()
    return jsonify({"message": f"Deleted training with name {name}"})
    
@app.route("/trainings", methods=["GET"])
def get_trainings():
    trainings = Training.query.order_by(Training.position).all()
    return jsonify([{"id": t.id, "name": t.name, "position": t.position} for t in trainings])

@app.route("/trainings/reorder", methods=["PATCH"])
def reorder_trainings():
    data = request.get_json()
    for item in data:
        training = Training.query.get(item["id"])
        if training:
            training.position = item["position"]
    db.session.commit()
    return jsonify({"status": "success"}), 200


@app.route("/operators/<int:operator_id>/training/<int:training_id>/status", methods=["PATCH"])
def update_status(operator_id, training_id):
    data = request.json
    new_status = data.get("status")

    if new_status not in ["not_trained", "trained", "shadowed", "ran_in_workshop", "can_train"]:
        return jsonify({"error": "Invalid status"}), 400

    training_status = TrainingStatus.query.filter_by(operator_id=operator_id, training_id=training_id).first()
    if not training_status:
        training_status = TrainingStatus(operator_id=operator_id, training_id=training_id, status=new_status)
        db.session.add(training_status)
    else:
        training_status.status = new_status

    db.session.commit()
    return jsonify({"message": "Status updated"})

if __name__ == "__main__":
    app.run(debug=True)
