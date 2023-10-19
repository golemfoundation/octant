from flask_apscheduler import APScheduler
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restx import Api
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from web3 import Web3
from web3.middleware import geth_poa_middleware

from app.contracts import abi
from app.contracts.epochs import Epochs
from app.contracts.erc20 import ERC20
from app.contracts.proposals import Proposals
from app.contracts.vault import Vault

from app.logging import init_logger

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
proposals = Proposals(abi=abi.PROPOSALS)
vault = Vault(abi=abi.VAULT)


def init_web3(app):
    w3.provider = app.config["WEB3_PROVIDER"]
    if geth_poa_middleware not in w3.middleware_onion:
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    glm.init_web3(w3, app.config["GLM_CONTRACT_ADDRESS"])
    epochs.init_web3(w3, app.config["EPOCHS_CONTRACT_ADDRESS"])
    proposals.init_web3(w3, app.config["PROPOSALS_CONTRACT_ADDRESS"])
    vault.init_web3(w3, app.config["VAULT_CONTRACT_ADDRESS"])


def init_scheduler(app):
    if app.config["SCHEDULER_ENABLED"] and app.config["ENV"] != "test":
        scheduler.init_app(app)
        scheduler.start()
