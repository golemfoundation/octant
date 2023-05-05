from eth_utils import to_checksum_address
from sqlalchemy.ext.declarative import declarative_base

from app.extensions import db

# Alias common SQLAlchemy names
Column = db.Column
Model = db.Model
relationship = db.relationship

Base = declarative_base()


class User(Model):
    __tablename__ = 'users'

    def __init__(self, *args, **kwargs):
        if 'address' in kwargs:
            kwargs['address'] = to_checksum_address(kwargs['address'])
        super().__init__(*args, **kwargs)

    id = Column(db.Integer, primary_key=True)
    address = Column(db.String(42), unique=True, nullable=False)
    nonce = Column(db.Integer, nullable=False, default=0)


class Allocation(Model):
    __tablename__ = 'allocations'

    def __init__(self, *args, **kwargs):
        if 'proposal_address' in kwargs:
            kwargs['proposal_address'] = to_checksum_address(kwargs['proposal_address'])
        super().__init__(*args, **kwargs)

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False)
    user_id = Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = relationship('User', backref=db.backref('allocations', lazy=True))
    proposal_address = Column(db.String(42), nullable=False)
    amount = Column(db.Float, nullable=False)
