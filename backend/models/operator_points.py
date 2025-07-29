from db_setup import db

class OperatorPoints(db.Model):
    __tablename__ = 'points'
    id = db.Column(db.Integer, primary_key=True)
    operator_id = db.Column(db.Integer, db.ForeignKey('operators.id'), nullable=False, unique=True)
    points = db.Column(db.Integer, default=0)