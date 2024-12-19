from app.pydantic import Model
from typing import List
from dataclasses import dataclass

from app.infrastructure.sablier.events import get_user_events_history
from app.context.manager import Context


@dataclass
class UserStreamsDTO:
    amount: str
    date_available_for_withdrawal: str
    is_cancelled: bool
    remaining_amount: str


class UserSablierStreamsService(Model):
    def get_sablier_streams(self, _: Context, user_address: str) -> List[UserStreamsDTO]:
        user_streams = get_user_events_history(user_address) # in practice: we should assume a user only has always one stream (one create event)

        user_streams_details = []
        for user_stream in user_streams:
            date_available_for_withdrawal = user_stream["endTime"]
            amount = user_stream["depositAmount"]
            is_cancelled = user_stream["canceled"]
            remaining_amount = user_stream["intactAmount"]

            user_streams_details.append(
                UserStreamsDTO(
                    amount=amount,
                    date_available_for_withdrawal=date_available_for_withdrawal,
                    is_cancelled=is_cancelled,
                    remaining_amount=remaining_amount
                )
            )

        return user_streams_details
