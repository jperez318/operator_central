from flask import Blueprint, jsonify
from models.operator_points import OperatorPoints

operator_points_bp = Blueprint('operator_points', __name__)

@operator_points_bp.route('/points', methods=['GET'])
def get_points():
    data = OperatorPoints.query.all()
    return jsonify([{"operator_id": p.operator_id, "points": p.points} for p in data])