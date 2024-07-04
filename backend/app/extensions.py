from flask_apscheduler import APScheduler
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restx import Api
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from web3 import Web3, middleware
from web3._utils.rpc_abi import RPC
from web3._utils.caching import (
    generate_cache_key,
)

from functools import wraps, partial
import lru
import threading
import time

from app.infrastructure.contracts import abi
from app.infrastructure.contracts.epochs import Epochs
from app.infrastructure.contracts.deposits import Deposits
from app.infrastructure.contracts.erc20 import ERC20
from app.infrastructure.contracts.projects import Projects
from app.infrastructure.contracts.vault import Vault
from app.infrastructure import GQLConnectionFactory

# Flask extensions
api = Api(
    version="1.0.0",
    title="Octant API",
    description="Octant REST API documentation",
    catch_all_404s=True,
)
socketio = SocketIO(cors_allowed_origins="*")
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
scheduler = APScheduler()
cache = Cache()

# Blockchain extensions
w3 = Web3()
glm = ERC20(abi=abi.ERC20)
epochs = Epochs(abi=abi.EPOCHS)
deposits = Deposits(abi=abi.DEPOSITS)
projects = Projects(abi=abi.PROJECTS)
vault = Vault(abi=abi.VAULT)

# GQL extensions
gql_factory = GQLConnectionFactory()


def is_get_block_by_number(app, method, params):
    return method in ["eth_getBlockByNumber"]


def is_epochs_or_deposits_contract(app, method, params):
    return method in ["eth_call"] and params[0]["to"] in [
        app.config["EPOCHS_CONTRACT_ADDRESS"],
        app.config["DEPOSITS_CONTRACT_ADDRESS"],
    ]


def is_glm_or_projects_contract(app, method, params):
    return method in ["eth_call"] and params[0]["to"] in [
        app.config["PROJECTS_CONTRACT_ADDRESS"],
        app.config["GLM_CONTRACT_ADDRESS"],
    ]


def _create_cache(app, cache_expiry_seconds, condition_fn, should_cache_fn):
    cache_class = partial(lru.LRU, 256)

    def cache_fn(make_request, web3):
        cache_obj = cache_class()
        lock = threading.Lock()

        def middleware_fn(method, params):
            lock_acquired = lock.acquire(blocking=False)

            try:
                if lock_acquired and condition_fn(app, method, params):
                    cache_key = generate_cache_key((method, params))
                    if cache_key in cache_obj:
                        cached_at, cached_response = cache_obj[cache_key]
                        cached_for = time.time() - cached_at

                        if cached_for <= cache_expiry_seconds:
                            return cached_response
                        else:
                            del cache_obj[cache_key]

                    # # cache either missed or expired so make the request.
                    response = make_request(method, params)

                    if should_cache_fn(response):
                        cache_obj[cache_key] = (time.time(), response)

                    return response
                else:
                    return make_request(method, params)
            finally:
                if lock_acquired:
                    lock.release()

        return middleware_fn

    return cache_fn


def init_web3(app):
    w3.provider = app.config["WEB3_PROVIDER"]
    if middleware.geth_poa_middleware not in w3.middleware_onion:
        w3.middleware_onion.inject(middleware.geth_poa_middleware, layer=0)

    middleware.validation.METHODS_TO_VALIDATE.remove(RPC.eth_call)

    w3.middleware_onion.add(middleware.time_based_cache_middleware)
    w3.middleware_onion.add(middleware.latest_block_based_cache_middleware)
    w3.middleware_onion.add(middleware.simple_cache_middleware)
    w3.middleware_onion.add(
        _create_cache(app, 600, is_glm_or_projects_contract, _generic_should_cache_web3)
    )
    w3.middleware_onion.add(
        _create_cache(app, 60, is_epochs_or_deposits_contract, (lambda x: True))
    )
    w3.middleware_onion.add(
        _create_cache(app, 20, is_get_block_by_number, _generic_should_cache_web3)
    )

    glm.init_web3(w3, app.config["GLM_CONTRACT_ADDRESS"])
    epochs.init_web3(w3, app.config["EPOCHS_CONTRACT_ADDRESS"])
    projects.init_web3(w3, app.config["PROJECTS_CONTRACT_ADDRESS"])
    vault.init_web3(w3, app.config["VAULT_CONTRACT_ADDRESS"])
    deposits.init_web3(w3, app.config["DEPOSITS_CONTRACT_ADDRESS"])


def init_subgraph(app):
    gql_factory.set_url(app.config)


def init_scheduler(app):
    if app.config["SCHEDULER_ENABLED"] and app.config["ENV"] != "test":
        scheduler.init_app(app)
        scheduler.start()


def _generic_should_cache_web3(response):
    if "error" in response:
        return False
    elif "result" not in response:
        return False
    if response["result"] is None:
        return False
    return True
