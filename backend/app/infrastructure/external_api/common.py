import time
from typing import Callable, Dict

from app.exceptions import ExternalApiException


def retry_request(
    req_func: Callable,
    status_code: int,
    no_retries: int = 3,
    sleep_time: int = 1,
    **kwargs,
) -> Dict | None:
    """
    Retry request 3 times if the status code is the same as the one passed as an argument.

    **kwargs: arguments to be passed to the request function
    req_func: function to be called
    status_code: status code to be checked
    no_retries: max number of retries to be done
    sleep_time: time to sleep between retries
    """
    if no_retries <= 0:
        return None

    try:
        return req_func(**kwargs)
    except ExternalApiException as e:
        if e.status_code == status_code:
            time.sleep(sleep_time)
            return retry_request(req_func, status_code, no_retries - 1, **kwargs)

        raise e
