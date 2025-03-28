from dataclasses import dataclass
from typing import List

from app.context.manager import Context
from app.infrastructure.sablier.events import (
    get_user_events_history,
    get_all_streams_history,
    SablierStream,
)
from app.pydantic import Model


@dataclass
class UserStreamsDTO:
    amount: str
    date_available_for_withdrawal: str
    is_cancelled: bool
    remaining_amount: str
    recipient_address: str


class UserSablierStreamsService(Model):
    def _prepare_streams(
        self, user_streams: List[SablierStream]
    ) -> List[UserStreamsDTO]:
        user_streams_details = []
        for user_stream in user_streams:
            date_available_for_withdrawal = user_stream["endTime"]
            amount = user_stream["depositAmount"]
            is_cancelled = user_stream["canceled"]
            remaining_amount = user_stream["intactAmount"]
            recipient_address = user_stream["recipient"]

            user_streams_details.append(
                UserStreamsDTO(
                    amount=amount,
                    date_available_for_withdrawal=date_available_for_withdrawal,
                    is_cancelled=is_cancelled,
                    remaining_amount=remaining_amount,
                    recipient_address=recipient_address,
                )
            )

        return user_streams_details

    def get_sablier_streams(
        self, _: Context, user_address: str
    ) -> List[UserStreamsDTO]:
        user_streams = get_user_events_history(
            user_address
        )  # in practice: we should assume a user only has always one stream (one create event)

        user_streams_details = self._prepare_streams(user_streams)

        return user_streams_details

    def get_all_sablier_streams(self, _: Context) -> List[UserStreamsDTO]:
        all_users_streams = get_all_streams_history()

        all_users_streams_details = self._prepare_streams(all_users_streams)

        return all_users_streams_details
