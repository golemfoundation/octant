from sqlalchemy.ext.declarative import declarative_base

from app.extensions import db

# Alias common SQLAlchemy names
Column = db.Column
Model = db.Model
relationship = db.relationship

Base = declarative_base()


class User(Model):
    __tablename__ = "users"

    id = Column(db.Integer, primary_key=True)
    address = Column(db.String(42), unique=True, nullable=False)
    nonce = Column(db.Integer, nullable=False, default=0)


class Allocation(Model):
    __tablename__ = "allocations"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user = relationship("User", backref=db.backref("allocations", lazy=True))
    proposal_address = Column(db.String(42), nullable=False)
    amount = Column(db.String, nullable=False)


class EpochSnapshot(Model):
    __tablename__ = "epoch_snapshots"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False, unique=True)
    glm_supply = Column(db.String, nullable=False)
    eth_proceeds = Column(db.String, nullable=False)
    total_effective_deposit = Column(db.String, nullable=False)
