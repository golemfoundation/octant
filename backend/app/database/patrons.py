from typing import List, Optional
from datetime import datetime
from itertools import groupby

from eth_utils import to_checksum_address
from sqlalchemy import func
from sqlalchemy.orm import Query

from app.database.models import PatronModeEvent

from app.extensions import db


def add_patron_mode_event(user_address: str, status: bool):
    user_address = to_checksum_address(user_address)
    db.session.add(
        PatronModeEvent(
            user_address=user_address,
            patron_mode_enabled=status,
            created_at=datetime.utcnow(),
        )
    )


def get_last_event(
    user_address: str, dt: Optional[datetime] = None
) -> [PatronModeEvent]:
    user_address = to_checksum_address(user_address)

    last_event_query = PatronModeEvent.query.filter_by(
        user_address=user_address
    ).order_by(PatronModeEvent.created_at.desc())

    if dt is not None:
        last_event_query.filter(PatronModeEvent.created_at <= dt)

    return last_event_query.first()


def get_user_history(user_address: str, from_datetime: datetime, limit: int):
    user_address = to_checksum_address(user_address)

    user_toggles: Query = (
        PatronModeEvent.query.filter(
            PatronModeEvent.user_address == user_address,
            PatronModeEvent.created_at <= from_datetime,
        )
        .order_by(PatronModeEvent.created_at.desc())
        .limit(limit)
        .subquery()
    )

    timestamp_at_limit_query = (
        db.session.query(func.min(user_toggles.c.created_at).label("limit_timestamp"))
        .group_by(user_toggles.c.user_address)
        .subquery()
    )

    toggles = PatronModeEvent.query.filter(
        PatronModeEvent.user_address == user_address,
        PatronModeEvent.created_at <= from_datetime,
        PatronModeEvent.created_at >= timestamp_at_limit_query.c.limit_timestamp,
    ).order_by(PatronModeEvent.created_at.desc())

    return toggles.all()


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
