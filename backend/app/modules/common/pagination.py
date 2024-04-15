import base64
from dataclasses import dataclass
from typing import List, Tuple, Optional

from app.modules.common.time import now, from_timestamp_s, Timestamp


@dataclass(frozen=True)
class PageRecord:
    timestamp: int  # Should be in seconds precision


class Cursor:
    @staticmethod
    def encode(timestamp: int, offset: int) -> str:
        return base64.urlsafe_b64encode(bytes(f"{timestamp}.{offset}", "ascii")).decode(
            "ascii"
        )

    @staticmethod
    def decode(cursor: Optional[str]) -> Tuple[Timestamp, int]:
        if cursor is None:
            return now(), 0
        timestamp, offset = base64.urlsafe_b64decode(cursor).decode("ascii").split(".")
        return from_timestamp_s(int(timestamp)), int(offset)


class Paginator:
    @staticmethod
    def query_limit(limit, offset):
        # we must query for all elems at the current timestamp (also events from the prev page, thus we add offset)
        # and one elem more to get calculate next page cursor
        return limit + offset + 1

    @staticmethod
    def extract_page(
        page_records: List[PageRecord], offset_at_timestamp: int, limit: int
    ) -> Tuple[List, Optional[str]]:
        next_page_start_index = offset_at_timestamp + limit
        current_page = page_records[offset_at_timestamp:next_page_start_index]

        next_page_start_elem = (
            page_records[next_page_start_index]
            if next_page_start_index < len(page_records)
            else None
        )
        next_page_cursor = None
        if next_page_start_elem is not None:
            next_offset = Paginator._get_offset(
                current_page, next_page_start_elem.timestamp, offset_at_timestamp
            )
            next_page_cursor = Cursor.encode(
                next_page_start_elem.timestamp, next_offset
            )

        return current_page, next_page_cursor

    @staticmethod
    def _get_offset(current_page_elems, next_elem_timestamp, prev_offset):
        offset = 0
        for elem in current_page_elems[::-1]:
            if elem.timestamp == next_elem_timestamp:
                offset += 1
            else:
                return offset

        # If we reach this line,
        # then all elems in the next page have same timestamp, so we have to add offset to the prev_offset
        return offset + prev_offset
