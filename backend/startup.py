# !!! IMPORTANT: DO NOT REARRANGE IMPORTS IN THIS FILE !!!
# The eventlet monkey patch needs to be applied before importing the Flask application for the following reasons:
# 1. Enabling Asynchronous I/O: The monkey patch is required to activate eventlet’s asynchronous and non-blocking I/O capabilities.
# Without this patch, the app's I/O requests might be blocked, which is not desirable for our API's performance.
# 2. Import Order Significance: The monkey patch must be applied before importing the Flask application to ensure that the app utilizes
# the asynchronous versions of standard library modules that have been patched by eventlet. If not done in this order, we might experience issues similar to
# what is reported in the following eventlet issue: https://github.com/eventlet/eventlet/issues/371
# This comment provides additional insight and helped resolve our specific problem: https://github.com/eventlet/eventlet/issues/371#issuecomment-779967181
# 3. Issue with dnspython: If dnspython is present in the environment, eventlet monkeypatches socket.getaddrinfo(),
# which breaks dns functionality. By setting the EVENTLET_NO_GREENDNS environment variable before importing eventlet,
# we prevent this monkeypatching

import os

os.environ["EVENTLET_NO_GREENDNS"] = "yes"
import eventlet  # noqa

eventlet.monkey_patch()

if os.getenv("SENTRY_DSN"):
    import sentry_sdk

    print("[+] Starting sentry")

    sentry_sdk.init(
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
        enable_tracing=True,
    )

from app import create_app  # noqa
from app.extensions import db  # noqa

app = create_app()


@app.teardown_request
def teardown_session(*args, **kwargs):
    db.session.remove()


if __name__ == "__main__":
    eventlet.wsgi.server(eventlet.listen(("0.0.0.0", 5000)), app, log=app.logger)
