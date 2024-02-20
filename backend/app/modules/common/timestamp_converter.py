from datetime import datetime


def timestamp_to_isoformat(timestamp_sec: int) -> str:
    return datetime.fromtimestamp(timestamp_sec).isoformat()
