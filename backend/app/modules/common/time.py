from dataclasses import dataclass
from datetime import datetime as DateTime, timezone


@dataclass
class Timestamp:
    def __init__(self, timestamp_us):
        if timestamp_us is None:
            raise ValueError
        self._timestamp_us = timestamp_us

    def get(self) -> int:
        return self.timestamp_us()

    def timestamp_us(self) -> int:
        return self._timestamp_us

    def timestamp_s(self) -> float:
        return self.timestamp_us() / 10**6

    def datetime(self) -> DateTime:
        return DateTime.fromtimestamp(self.timestamp_s())

    def to_isoformat(self):
        return self.datetime().isoformat()

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return f"Timestamp({str(self.timestamp_us())})"

    def __eq__(self, o):
        if isinstance(o, Timestamp):
            return self._timestamp_us == o._timestamp_us
        elif isinstance(o, int):
            return self._timestamp_us == o
        else:
            return False

    def __le__(self, o):
        if isinstance(o, Timestamp):
            return self._timestamp_us <= o._timestamp_us
        else:
            raise TypeError(
                f"'<=' not supported between instances of type '{type(self)}' and '{type(o)}'"
            )


def from_timestamp_s(timestamp_s: float) -> Timestamp:
    return Timestamp(int(timestamp_s * 10**6))


def from_timestamp_us(timestamp_us) -> Timestamp:
    return Timestamp(timestamp_us)


def from_datetime(dt: DateTime) -> Timestamp:
    return from_timestamp_s(dt.timestamp())


def now() -> Timestamp:
    utc_time = DateTime.now(timezone.utc)
    unix_timestamp = utc_time.timestamp()
    return from_timestamp_s(unix_timestamp)


def sec_to_days(sec: int) -> int:
    return int(sec / 86400)


def days_to_sec(days: int) -> int:
    return int(days * 86400)
