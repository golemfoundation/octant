from flask import current_app as app

from eth_utils.address import to_checksum_address

import json
from typing import List, Optional, Tuple

from app.extensions import db
from app.infrastructure import database
from app.context.manager import Context
from app.pydantic import Model
from app.exceptions import UserNotFound


class HolonymAntisybil(Model):
    def get_sbt_status(
        self, _: Context, user_address: str
    ) -> Optional[Tuple[bool, List[str]]]:
        user_address = to_checksum_address(user_address)
        try:
            entry = database.user_antisybil.get_sbt_by_address(user_address)
        except UserNotFound as ex:
            app.logger.debug(
                f"User {user_address} antisybil status: except UserNotFound"
            )
            raise ex

        if entry is not None:
            return entry.has_sbt, json.loads(entry.sbt_details)
        return None

    def fetch_sbt_status(
        self, _: Context, user_address: str
    ) -> Optional[Tuple[bool, List[str]]]:
        from app.infrastructure.external_api.holonym.antisybil import check

        user_address = to_checksum_address(user_address)
        return check(user_address)

    def update_sbt_status(
        self, _: Context, user_address: str, has_sbt: bool, cred_type: List[str]
    ):
        database.user_antisybil.add_sbt(user_address, has_sbt, cred_type)
        db.session.commit()
