from app.extensions import db
from app.context.manager import Context
from app.infrastructure import database
from app.pydantic import Model

from datetime import datetime


class InitialUserAntisybil(Model):
    def get_antisybil_status(self, _: Context, user_address: str) -> (int, datetime):
        score = database.user_antisybil.get_score_by_address(user_address)
        return score.score, score.expires_at

    def update_antisybil_status(
        self,
        context: Context,
        user_address: str,
        score: str,
        expires_at: datetime,
        stamps,
    ):
        database.user_antisybil.add_score(user_address, score, expires_at, stamps)
        db.session.commit()
