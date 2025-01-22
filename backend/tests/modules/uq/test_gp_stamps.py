import json
from app.modules.user.antisybil.core import _has_guest_stamp_applied_by_gp
from app.infrastructure.database.models import GPStamps
from datetime import datetime, timedelta, timezone


# They are not complete stamps, but only the fields we need.
ten_days_ago = datetime.now(timezone.utc) - timedelta(days=10)
in_ten_days = datetime.now(timezone.utc) + timedelta(days=10)
now = datetime.now(timezone.utc)
ten_days_ago_str = ten_days_ago.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
in_ten_days_str = in_ten_days.strftime("%Y-%m-%dT%H:%M:%S.%fZ")

t_valid_stamp = [
    {
        "credential": {
            "issuanceDate": ten_days_ago_str,
            "expirationDate": in_ten_days_str,
            "credentialSubject": {"provider": "AllowList#OctantFinal"},
        },
    }
]

t_expired_stamp = [
    {
        "credential": {
            "issuanceDate": ten_days_ago_str,
            "expirationDate": ten_days_ago_str,
            "credentialSubject": {"provider": "AllowList#OctantFinal"},
        },
    }
]


def test_has_guest_stamp_applied_by_gp():
    valid_stamps = GPStamps(
        user_id=1, score=100, stamps=json.dumps(t_valid_stamp), expires_at=in_ten_days
    )
    assert _has_guest_stamp_applied_by_gp(
        valid_stamps, now
    ), "We should consider the stamp if it's not expired"


def test_expired_stamps():
    expired_stamps = GPStamps(
        user_id=1,
        score=100,
        stamps=json.dumps(t_expired_stamp),
        expires_at=ten_days_ago,
    )
    assert not _has_guest_stamp_applied_by_gp(
        expired_stamps, now
    ), "We should not consider the stamp if it's expired"
