from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Operator, Training, TrainingStatus
from datetime import datetime

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
            "status": status_record.status if status_record else None,
            "date_assigned": status_record.date_assigned.isoformat() if status_record and status_record.date_assigned else None
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
    print("DEBUG received data:", data)
    name = data.get("name")
    num_operators = data.get("num_operators", "")
    time_taken = data.get("time_taken", "")
    line = data.get("line", "")
    information = data.get("information", "")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    Training.query.update({Training.position: Training.position + 1})

    training = Training(
        name=name,
        num_operators=num_operators,
        time_taken=time_taken,
        line=line,
        information=information,
        position=0
    )
    db.session.add(training)
    db.session.commit()

    operators = Operator.query.all()
    if not operators:
        return jsonify({"id": training.id, "name": training.name})

    for op in operators:
        new_status = TrainingStatus(operator_id=op.id, training_id=training.id, status="not_trained")
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
    return jsonify([
        {
            "id": t.id,
            "name": t.name,
            "position": t.position,
            "important": t.important,
            "num_operators": t.num_operators,
            "time_taken": t.time_taken,
            "line": t.line,
            "information": t.information
        } for t in trainings
    ])

@app.route("/trainings/<int:training_id>/importance", methods=["PATCH"])
def switch_importance(training_id):
    training = Training.query.get(training_id)
    if not training:
        return jsonify({"error": "Training not found"}), 404
    training.important = not training.important

    # Get all trainings, important first, then by position
    all_trainings = Training.query.order_by(Training.important.desc(), Training.position.asc()).all()

    # Move the toggled training to the top of its new group
    if training.important:
        # Move to top of important
        important_trainings = [t for t in all_trainings if t.important]
        important_trainings.insert(0, important_trainings.pop(important_trainings.index(training)))
        not_important_trainings = [t for t in all_trainings if not t.important]
        new_order = important_trainings + not_important_trainings
    else:
        # Move to bottom of important (top of not important)
        important_trainings = [t for t in all_trainings if t.important]
        not_important_trainings = [t for t in all_trainings if not t.important]
        not_important_trainings.insert(0, not_important_trainings.pop(not_important_trainings.index(training)))
        new_order = important_trainings + not_important_trainings

    # Reindex positions
    for idx, t in enumerate(new_order):
        t.position = idx

    db.session.commit()
    return jsonify({"status": "success"}), 200

@app.route("/trainings/reorder", methods=["PATCH"])
def reorder_trainings():
    data = request.get_json()

    # Build a dict of id -> position for the new order
    id_to_position = {item["id"]: item["position"] for item in data}

    # Get all trainings and their importance
    trainings = Training.query.filter(Training.id.in_(id_to_position.keys())).all()
    important_positions = [id_to_position[t.id] for t in trainings if t.important]
    if important_positions:
        max_important_position = max(important_positions)
        # Disallow any not important training from being before (or at) the last important
        for t in trainings:
            if not t.important and id_to_position[t.id] <= max_important_position:
                return jsonify({"error": "Cannot move an unimportant training in front of an important training."}), 400

    # If valid, update positions
    for t in trainings:
        t.position = id_to_position[t.id]
    db.session.commit()
    return jsonify({"status": "success"}), 200

@app.route("/trainings/<int:training_id>/rename", methods=["PATCH"])
def rename_training(training_id):
    data = request.get_json()
    new_name = data.get("name")
    if not new_name:
        return jsonify({"error": "Training name is required"}), 400

    existing = Training.query.filter(Training.name == new_name, Training.id != training_id).first()
    if existing:
        return jsonify({"error": "Training name already exists"}), 409

    training = Training.query.get(training_id)
    if not training:
        return jsonify({"error": "Training not found"}), 404

    training.name = new_name
    db.session.commit()

    return jsonify({"message": "Training renamed successfully"})

@app.route("/trainings/<int:training_id>", methods=["PATCH"])
def update_training(training_id):
    data = request.json
    training = Training.query.get(training_id)
    if not training:
        return jsonify({"error": "Training not found"}), 404

    for field in ["num_operators", "time_taken", "line", "information"]:
        if field in data:
            setattr(training, field, data[field])

    db.session.commit()
    return jsonify({"message": "Training updated"})


@app.route("/operators/<int:operator_id>/training/<int:training_id>/status", methods=["PATCH"])
def update_status(operator_id, training_id):
    data = request.json
    new_status = data.get("status")

    if new_status not in ["not_trained", "trained", "shadowed", "ran_in_workshop", "can_train"]:
        return jsonify({"error": "Invalid status"}), 400

    training_status = TrainingStatus.query.filter_by(operator_id=operator_id, training_id=training_id).first()
    if not training_status:
        training_status = TrainingStatus(operator_id=operator_id, training_id=training_id, status=new_status, date_assigned=datetime.now())
        db.session.add(training_status)
    else:
        training_status.status = new_status
        training_status.date_assigned = datetime.now()

    db.session.commit()
    return jsonify({"message": "Status updated"})

if __name__ == "__main__":
    app.run(debug=True)
