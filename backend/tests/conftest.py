import pytest

from app import create_app
from app.extensions import db as _db, w3
from app.settings import TestConfig

MNEMONIC = "test test test test test test test test test test test junk"


@pytest.fixture(scope='function')
def app():
    """An application for the tests."""
    _app = create_app(TestConfig)

    with _app.app_context():
        _db.create_all()

    ctx = _app.test_request_context()
    ctx.push()

    yield _app, _db

    _db.session.close()
    _db.drop_all()
    ctx.pop()


@pytest.fixture(scope="function")
def user_accounts():
    w3.eth.account.enable_unaudited_hdwallet_features()
    return [w3.eth.account.from_mnemonic(MNEMONIC, account_path=f"m/44'/60'/0'/0/{i}") for i in
            range(10)]


@pytest.fixture(scope="module")
def proposal_accounts():
    w3.eth.account.enable_unaudited_hdwallet_features()
    return [w3.eth.account.from_mnemonic(MNEMONIC, account_path=f"m/44'/60'/0'/0/{i}") for i in
            range(10, 20)]
