from datetime import datetime


def check_if_future(timestamp: int) -> bool:
    now_ts = int(datetime.utcnow().timestamp())
    return timestamp > now_ts
