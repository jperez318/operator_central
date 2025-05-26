from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Operator(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Training(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class TrainingStatus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    operator_id = db.Column(db.Integer, db.ForeignKey('operator.id'), nullable=False)
    training_id = db.Column(db.Integer, db.ForeignKey('training.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
