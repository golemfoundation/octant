from threading import Lock
from functools import wraps
from typing import Callable


def synchronized(wrapped: Callable):
    lock = Lock()

    @wraps(wrapped)
    def _wrap(*args, **kwargs):
        with lock:
            return wrapped(*args, **kwargs)

    return _wrap
