from datetime import datetime as dt
from typing import Optional

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


class PatronModeEvent(BaseModel):
    __tablename__ = "patron_events"

    id = Column(db.Integer, primary_key=True)
    user_address = Column(db.String(42), nullable=False)
    patron_mode_enabled = Column(db.Boolean, nullable=False)

    def get_effective_deposit(self, epoch: int) -> Optional[int]:
        effective_deposit = None
        for d in self.deposits:
            if d.epoch == epoch:
                effective_deposit = d.effective_deposit
        return int(effective_deposit) if effective_deposit is not None else None

    def get_budget(self, epoch: int) -> Optional[int]:
        budget = None
        for b in self.budgets:
            if b.epoch == epoch:
                budget = b.budget
        return int(budget) if budget is not None else None


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
    operational_cost = Column(db.String, nullable=False)


class FinalizedEpochSnapshot(BaseModel):
    __tablename__ = "finalized_epoch_snapshots"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False, unique=True)
    matched_rewards = Column(db.String, nullable=False)
    patrons_rewards = Column(db.String, nullable=False)
    leftover = Column(db.String, nullable=False)
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
