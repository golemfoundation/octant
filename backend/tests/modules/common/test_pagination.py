from freezegun import freeze_time

from app.modules.common.pagination import Paginator, PageRecord, Cursor
from app.modules.common.time import from_timestamp_s


def test_cursor_encode_decode():
    timestamp = 1710720000
    offset = 5

    cursor = Cursor.encode(timestamp, offset)
    decoded_timestamp, decoded_offset = Cursor.decode(cursor)

    assert decoded_timestamp == from_timestamp_s(timestamp)
    assert decoded_offset == offset


@freeze_time("2024-03-18 00:00:00")
def test_cursor_decode_none():
    timestamp, offset = Cursor.decode(None)
    assert timestamp == from_timestamp_s(1710720000)
    assert offset == 0


def test_query_limit():
    assert Paginator.query_limit(limit=10, offset=0) == 11
    assert Paginator.query_limit(limit=5, offset=3) == 9
    assert Paginator.query_limit(limit=20, offset=15) == 36


def test_extract_page():
    page_records = [
        PageRecord(1),
        PageRecord(2),
        PageRecord(3),
        PageRecord(4),
        PageRecord(5),
        PageRecord(6),
    ]
    limit = 2

    result, cursor = Paginator.extract_page(page_records, 0, limit)
    assert result == [PageRecord(1), PageRecord(2)]
    assert cursor == "My4w"

    result, cursor = Paginator.extract_page(page_records, 2, limit)
    assert result == [PageRecord(3), PageRecord(4)]
    assert cursor == "NS4w"

    result, cursor = Paginator.extract_page(page_records, 4, limit)
    assert result == [PageRecord(5), PageRecord(6)]
    assert cursor is None
