from typing import List, Optional
from datetime import datetime
from itertools import groupby

from app.infrastructure.database.models import PatronModeEvent

from app.extensions import db


def add_patron_mode_event(user_address: str, status: bool, created_at=None):
    db.session.add(
        PatronModeEvent(
            user_address=user_address,
            patron_mode_enabled=status,
            created_at=created_at if created_at is not None else datetime.utcnow(),
        )
    )


def get_last_event(
    user_address: str, dt: Optional[datetime] = None
) -> [PatronModeEvent]:
    last_event_query = PatronModeEvent.query.filter_by(
        user_address=user_address
    ).order_by(PatronModeEvent.created_at.desc())

    if dt is not None:
        last_event_query.filter(PatronModeEvent.created_at <= dt)

    return last_event_query.first()


def get_all_patrons_at_timestamp(dt: datetime) -> List[str]:
    patron_events: List[PatronModeEvent] = (
        PatronModeEvent.query.filter(PatronModeEvent.created_at <= dt).order_by(
            PatronModeEvent.user_address
        )
    ).all()

    patrons = []
    for patron, events in groupby(patron_events, lambda e: e.user_address):
        last_event = sorted(events, key=lambda e: e.created_at, reverse=True)[0]
        if last_event.patron_mode_enabled:
            patrons.append(patron)

    return patrons
