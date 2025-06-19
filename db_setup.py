from app import app
from models import db, Training

with app.app_context():
    db.create_all()

    default_training = Training.query.get(1)
    if not default_training:
        default_training = Training(id=1, name='Default Training')
        db.session.add(default_training)
        db.session.commit()
    print("✅ Database initialized!")
