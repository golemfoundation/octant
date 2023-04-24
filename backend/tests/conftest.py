import pytest

from app import create_app


@pytest.fixture(scope='function')
def app():
    _app = create_app()

    ctx = _app.test_request_context()
    ctx.push()

    yield _app

    ctx.pop()
