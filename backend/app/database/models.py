from datetime import datetime as dt

from app.extensions import db

# Alias common SQLAlchemy names
Column = db.Column
Model = db.Model
relationship = db.relationship
UniqueConstraint = db.UniqueConstraint


class BaseModel(Model):
    __abstract__ = True
    created_at = Column(db.TIMESTAMP, default=dt.utcnow)


class User(BaseModel):
    __tablename__ = "users"

    id = Column(db.Integer, primary_key=True)
    address = Column(db.String(42), unique=True, nullable=False)
    allocation_nonce = Column(
        db.Integer,
        nullable=True,
        comment="Allocations signing nonce, last used value. Range [0..inf)",
    )
    patron_mode = Column(db.Boolean, default=False, nullable=False)


class UserConsents(BaseModel):
    __tablename__ = "user_consents"  # terms of service consents

    id = Column(db.Integer, primary_key=True)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = relationship("User", backref=db.backref("consents", lazy=True))
    ip = Column(db.String, nullable=False)


class Allocation(BaseModel):
    __tablename__ = "allocations"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    nonce = Column(db.Integer, nullable=False)
    user = relationship("User", backref=db.backref("allocations", lazy=True))
    proposal_address = Column(db.String(42), nullable=False)
    amount = Column(db.String, nullable=False)
    deleted_at = Column(db.TIMESTAMP, nullable=True)


class AllocationSignature(BaseModel):
    __tablename__ = "allocations_signatures"

    id = Column(db.Integer, primary_key=True)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user = relationship("User", backref=db.backref("allocations_signatures", lazy=True))
    nonce = Column(db.Integer, nullable=False)
    epoch = Column(db.Integer, nullable=False)
    signature = Column(db.String(132), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "nonce", name="user_nonce_unique_constraint"),
    )


class PendingEpochSnapshot(BaseModel):
    __tablename__ = "pending_epoch_snapshots"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False, unique=True)
    eth_proceeds = Column(db.String, nullable=False)
    total_effective_deposit = Column(db.String, nullable=False)
    locked_ratio = Column(db.String, nullable=False)
    total_rewards = Column(db.String, nullable=False)
    all_individual_rewards = Column(db.String, nullable=False)


class FinalizedEpochSnapshot(BaseModel):
    __tablename__ = "finalized_epoch_snapshots"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False, unique=True)
    matched_rewards = Column(db.String, nullable=False)
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


class Budget(BaseModel):
    __tablename__ = "budgets"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user = relationship("User", backref=db.backref("budgets", lazy=True))
    budget = Column(db.String, nullable=False)


class Reward(BaseModel):
    __tablename__ = "rewards"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False)
    address = Column(db.String(42), nullable=False)
    amount = Column(db.String, nullable=False)
    matched = Column(db.String, nullable=True)


class EpochZeroClaim(BaseModel):
    __tablename__ = "epoch_zero_claims"

    address = Column(db.String(42), primary_key=True, nullable=False)
    claimed = Column(db.Boolean, default=False)
    claim_nonce = db.Column(db.Integer(), unique=True, nullable=True)
