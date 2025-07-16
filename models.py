from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Operator(db.Model):
    __tablename__ = 'operators'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)

    training_statuses = db.relationship(
        'TrainingStatus',
        backref='operator',
        cascade='all, delete-orphan'
    )

class Training(db.Model):
    __tablename__ = 'trainings'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.Integer, nullable=False, default=0)
    important = db.Column(db.Boolean, nullable=False, default=True)

    training_statuses = db.relationship(
        'TrainingStatus',
        backref='training',
        cascade='all, delete-orphan'
    )

class TrainingStatus(db.Model):
    __tablename__ = 'training_statuses'
    id = db.Column(db.Integer, primary_key=True)
    operator_id = db.Column(db.Integer, db.ForeignKey('operators.id'), nullable=False)
    training_id = db.Column(db.Integer, db.ForeignKey('trainings.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('operator_id', 'training_id', name='_operator_training_uc'),
    )
