from decimal import Decimal
from typing import Optional

from app.extensions import db
from app.modules.common import time

# Alias common SQLAlchemy names
Column = db.Column
Model = db.Model
relationship = db.relationship
UniqueConstraint = db.UniqueConstraint


class BaseModel(Model):
    __abstract__ = True
    created_at = Column(db.TIMESTAMP, default=lambda: time.now().datetime())


class User(BaseModel):
    __tablename__ = "users"

    id = Column(db.Integer, primary_key=True)
    address = Column(db.String(42), unique=True, nullable=False)
    allocation_nonce = Column(
        db.Integer,
        nullable=True,
        comment="Allocations signing nonce, last used value. Range [0..inf)",
    )

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


class GPStamps(BaseModel):
    __tablename__ = "gitcoin_passport_stamps"
    id = Column(db.Integer, primary_key=True)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    score = Column(db.Float, nullable=False)
    expires_at = Column(db.TIMESTAMP, nullable=False)
    # storing for analysis
    stamps = Column(db.String, nullable=False)


class HolonymSBT(BaseModel):
    __tablename__ = "holonym_sbts"
    id = Column(db.Integer, primary_key=True)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    has_sbt = Column(db.Boolean, nullable=False, default=False)
    sbt_details = Column(db.String, nullable=False, default="[]")


class PatronModeEvent(BaseModel):
    __tablename__ = "patron_events"

    id = Column(db.Integer, primary_key=True)
    user_address = Column(db.String(42), nullable=False)
    patron_mode_enabled = Column(db.Boolean, nullable=False)


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
    project_address = Column(db.String(42), nullable=False)
    amount = Column(db.String, nullable=False)
    deleted_at = Column(db.TIMESTAMP, nullable=True)


class AllocationRequest(BaseModel):
    __tablename__ = "allocations_requests"

    id = Column(db.Integer, primary_key=True)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user = relationship("User", backref=db.backref("allocations_requests", lazy=True))
    nonce = Column(db.Integer, nullable=False)
    epoch = Column(db.Integer, nullable=False)
    signature = Column(db.String, nullable=False)
    is_manually_edited = Column(db.Boolean, nullable=True)
    leverage = Column(db.Float, nullable=True)

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
    vanilla_individual_rewards = Column(db.String, nullable=False)
    operational_cost = Column(db.String, nullable=False)
    ppf = Column(db.String, nullable=True)
    community_fund = Column(db.String, nullable=True)

    @property
    def validated_ppf(self):
        return int(self.ppf) if self.ppf else None

    @property
    def validated_community_fund(self):
        return int(self.community_fund) if self.community_fund else None


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


class MultisigSignatures(BaseModel):
    __tablename__ = "multisig_signatures"

    id = Column(db.Integer, primary_key=True)
    address = Column(db.String(42), nullable=False)
    type = Column(db.String, nullable=False)
    message = Column(db.String, nullable=False)
    msg_hash = Column(db.String, nullable=False)
    safe_msg_hash = Column(db.String, nullable=False)
    status = Column(db.String, nullable=False)
    user_ip = Column(db.String, nullable=False)
    confirmed_signature = Column(db.String, nullable=True)


class ScoreDelegation(BaseModel):
    id = Column(db.Integer, primary_key=True)
    hashed_addr = Column(db.String, nullable=False)


class UniquenessQuotient(BaseModel):
    __tablename__ = "uniqueness_quotients"

    id = Column(db.Integer, primary_key=True)
    epoch = Column(db.Integer, nullable=False)
    user_id = Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    score = Column(db.String, nullable=False)
    user = relationship("User", backref=db.backref("uniqueness_quotients", lazy=True))

    @property
    def validated_score(self):
        return Decimal(self.score)
