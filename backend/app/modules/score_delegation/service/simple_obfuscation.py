from app.extensions import db
from app.context.manager import Context
from app.infrastructure import database
from app.modules.common.verifier import Verifier
from app.modules.dto import ScoreDelegationPayload
from app.modules.score_delegation import core
from app.modules.score_delegation.core import get_hashed_addresses
from app.pydantic import Model


class SimpleObfuscationDelegationVerifier(Verifier, Model):
    def _verify_logic(self, context: Context, **kwargs):
        hashed_addresses, action_type = (
            kwargs["hashed_addresses"],
            kwargs["action_type"],
        )
        get_all_delegations = database.score_delegation.get_all_delegations()
        core.verify_score_delegation(hashed_addresses, get_all_delegations, action_type)

    def _verify_signature(self, _: Context, **kwargs):
        payload, action_type = kwargs["payload"], kwargs["action_type"]
        core.verify_signatures(payload, action_type)


class SimpleObfuscationDelegation(Model):
    verifier: Verifier

    def delegate(self, context: Context, payload: ScoreDelegationPayload):
        hashed_addresses = get_hashed_addresses(context, payload)

        self.verifier.verify(
            context, hashed_addresses=hashed_addresses, payload=payload
        )

        primary, secondary, both = hashed_addresses
        # TODO: fetch the score and save it to db linked to primary address
        database.score_delegation.save_delegation(primary, secondary, both)
        db.session.commit()

    def recalculate(self, context: Context, payload: ScoreDelegationPayload):
        hashed_addresses = get_hashed_addresses(context, payload)

        self.verifier.verify(
            context, hashed_addresses=hashed_addresses, payload=payload
        )
        # TODO: fetch the score and save it to db linked to primary address
