from app.pydantic import Model
from typing import List
from dataclasses import dataclass

from app.infrastructure.sablier.events import get_streams_with_create_events_to_user
from app.context.manager import Context


@dataclass
class UserWinningDTO:
    amount: str
    date_available_for_withdrawal: str


class RaffleWinningsService(Model):
    def get_user_winnings(self, _: Context, user_address: str) -> List[UserWinningDTO]:
        streams = get_streams_with_create_events_to_user(user_address)
        user_winnings = []

        for stream in streams:
            date_available_for_withdrawal = stream["endTime"]
            amount = stream["depositAmount"]
            user_winnings.append(
                UserWinningDTO(
                    amount=amount,
                    date_available_for_withdrawal=date_available_for_withdrawal,
                )
            )

        return user_winnings
