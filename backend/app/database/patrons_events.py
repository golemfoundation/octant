from datetime import datetime
from typing import Optional, List

from eth_utils import to_checksum_address
from sqlalchemy import desc, func, and_

from app.database.models import PatronEvent
from app.extensions import db


def get_last_event(user_address: str) -> Optional[PatronEvent]:
    return (
        PatronEvent.query.filter_by(address=to_checksum_address(user_address))
        .order_by(desc(PatronEvent.created_at))
        .first()
    )


def toggle_patron_mode(user_address: str) -> PatronEvent:
    last_event = get_last_event(user_address)
    toggle = True if last_event is None else not last_event.toggle
    now = datetime.utcnow()

    event = PatronEvent(address=user_address, toggle=toggle, created_at=now)
    db.session.add(event)

    return event


def get_all_enabled_patrons(timestamp: int) -> List[str]:
    target_time = datetime.utcfromtimestamp(timestamp)

    # Create a Common Table Expression (CTE) to find the latest event for each patron
    latest_event_cte = (
        db.session.query(
            PatronEvent.address,
            func.max(PatronEvent.created_at).label("latest_event_time"),
            PatronEvent.toggle,
        )
        .filter(PatronEvent.created_at <= target_time)
        .group_by(PatronEvent.address)
        .cte()
    )

    # Join the CTE with the original table on address and created_at,
    # and filter for patrons that are enabled in their latest event
    enabled_patrons = (
        db.session.query(PatronEvent.address)
        .join(
            latest_event_cte,
            and_(
                PatronEvent.address == latest_event_cte.c.address,
                PatronEvent.created_at == latest_event_cte.c.latest_event_time,
            ),
        )
        .filter(PatronEvent.toggle == True)  # noqa: E712
        .all()
    )

    return [patron.address for patron in enabled_patrons]
