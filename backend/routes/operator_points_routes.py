from flask import request, Blueprint, jsonify
from models.operator_points import OperatorPoints, OOTMCategory
from db_setup import db

operator_points_bp = Blueprint('operator_points', __name__)

@operator_points_bp.route('/points', methods=['GET'])
def get_points():
    data = OperatorPoints.query.all()
    return jsonify([{"operator_id": p.operator_id, "points": p.points} for p in data])

@operator_points_bp.route("/ootm_categories", methods=["GET"])
def get_categories():
    categories = OOTMCategory.query.all()
    return jsonify([{"id": c.id, "name": c.name, "points": c.points} for c in categories])

@operator_points_bp.route("/add_points", methods=["PATCH"])
def add_points():
    data = request.json
    operator_id = data["operator_id"]
    points_to_add = data["points"]

    op_points = OperatorPoints.query.filter_by(operator_id=operator_id).first()
    if not op_points:
        op_points = OperatorPoints(operator_id=operator_id, points=0)
        db.session.add(op_points)

    op_points.points += points_to_add
    db.session.commit()
    return jsonify({"success": True, "new_points": op_points.points})

@operator_points_bp.route("/new_month", methods=["PATCH"])
def new_month():
    data = OperatorPoints.query.all()
    for op in data:
        op.points_lastmonth = op.points
        op.points = 0
    db.session.commit()
    return jsonify({"success": True})
