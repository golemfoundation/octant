from datetime import datetime as dt

from app.extensions import db

# Alias common SQLAlchemy names
Column = db.Column
Model = db.Model
relationship = db.relationship


class BaseModel(Model):
    __abstract__ = True
    created_at = Column(db.TIMESTAMP, default=dt.utcnow)


class User(BaseModel):
    __tablename__ = "users"

    id = Column(db.Integer, primary_key=True)
    address = Column(db.String(42), unique=True, nullable=False)
    allocation_nonce = Column(db.Integer, nullable=False, default=0)


class UserConsents(BaseModel):
    __tablename__ = "user_consents"  # terms of serivce consents

    id = Column(db.Integer, primary_key=True)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = relationship("User", backref=db.backref("consents", lazy=True))
    ip = Column(db.String, nullable=False)


class Allocation(BaseModel):
    __tablename__ = "allocations"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user = relationship("User", backref=db.backref("allocations", lazy=True))
    proposal_address = Column(db.String(42), nullable=False)
    amount = Column(db.String, nullable=False)
    deleted_at = Column(db.TIMESTAMP, nullable=True)


class PendingEpochSnapshot(BaseModel):
    __tablename__ = "pending_epoch_snapshots"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False, unique=True)
    glm_supply = Column(db.String, nullable=False)
    eth_proceeds = Column(db.String, nullable=False)
    total_effective_deposit = Column(db.String, nullable=False)
    locked_ratio = Column(db.String, nullable=False)
    total_rewards = Column(db.String, nullable=False)
    all_individual_rewards = Column(db.String, nullable=False)


class FinalizedEpochSnapshot(BaseModel):
    __tablename__ = "finalized_epoch_snapshots"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False, unique=True)
    withdrawals_merkle_root = Column(db.String)
    total_withdrawals = Column(db.String)


class Deposit(BaseModel):
    __tablename__ = "deposits"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user = relationship("User", backref=db.backref("deposits", lazy=True))
    effective_deposit = Column(db.String, nullable=False)
    epoch_end_deposit = Column(db.String, nullable=False)


class Reward(BaseModel):
    __tablename__ = "rewards"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False)
    address = Column(db.String(42), nullable=False)
    amount = Column(db.String, nullable=False)


class EpochZeroClaim(BaseModel):
    __tablename__ = "epoch_zero_claims"

    address = Column(db.String(42), primary_key=True, nullable=False)
    claimed = Column(db.Boolean, default=False)
    claim_nonce = db.Column(db.Integer(), unique=True, nullable=True)
