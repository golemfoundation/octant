from datetime import datetime
from typing import Protocol, runtime_checkable, Tuple, Container

from app.context.manager import Context
from app.extensions import db
from app.infrastructure import database
from app.modules.common.delegation import get_hashed_addresses
from app.modules.common.verifier import Verifier
from app.modules.dto import ScoreDelegationPayload
from app.modules.score_delegation import core
from app.modules.score_delegation.core import ActionType
from app.pydantic import Model

from flask import current_app as app


@runtime_checkable
class Antisybil(Protocol):
    def fetch_antisybil_status(
        self, _: Context, user_address: str
    ) -> Tuple[float, datetime, any]:
        ...

    def update_antisybil_status(
        self,
        _: Context,
        user_address: str,
        score: float,
        expires_at: datetime,
        stamps,
    ):
        ...


class SimpleObfuscationDelegationVerifier(Verifier, Model):
    def _verify_logic(self, context: Context, **kwargs):
        hashed_addresses, action_type, score = (
            kwargs["hashed_addresses"],
            kwargs["action_type"],
            kwargs["score"],
        )
        get_all_delegations = database.score_delegation.get_all_delegations()
        core.verify_score_delegation(
            hashed_addresses, get_all_delegations, score, action_type
        )

    def _verify_signature(self, _: Context, **kwargs):
        payload, action_type = kwargs["payload"], kwargs["action_type"]
        core.verify_signatures(payload, action_type)


class SimpleObfuscationDelegation(Model):
    verifier: Verifier
    antisybil: Antisybil

    def delegate(self, context: Context, payload: ScoreDelegationPayload):
        primary, secondary, both = get_hashed_addresses(
            payload.primary_addr,
            payload.secondary_addr,
        )
        self._delegation(context, payload, ActionType.DELEGATION)
        database.score_delegation.save_delegation(primary, secondary, both)
        db.session.commit()

    def recalculate(self, context: Context, payload: ScoreDelegationPayload):
        self._delegation(context, payload, ActionType.RECALCULATION)
        db.session.commit()

    def check(self, _: Context, addresses: list[str]) -> Container[Tuple[str, str]]:
        all_hashes = database.score_delegation.get_all_delegations()
        return core.delegation_check(
            addresses,
            all_hashes,
            app.config["DELEGATION_SALT"],
            app.config["DELEGATION_SALT_PRIMARY"],
        )

    def _delegation(
        self, context: Context, payload: ScoreDelegationPayload, action: ActionType
    ):
        hashed_addresses = get_hashed_addresses(
            payload.primary_addr, payload.secondary_addr
        )
        score, expires_at, stamps = self.antisybil.fetch_antisybil_status(
            context, payload.secondary_addr
        )
        self.verifier.verify(
            context,
            hashed_addresses=hashed_addresses,
            payload=payload,
            score=score,
            action_type=action,
        )
        self.antisybil.update_antisybil_status(
            context, payload.primary_addr, score, expires_at, stamps
        )
