import logging

from flask_apscheduler import APScheduler
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restx import Api
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from gql import Client
from gql.transport.aiohttp import AIOHTTPTransport
from web3 import Web3
from web3.middleware import geth_poa_middleware

# Flask extensions
api = Api(
    version="1.0.0", title="Octant API", description="Octant REST API documentation",
    catch_all_404s=True
)
socketio = SocketIO(cors_allowed_origins="*")
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
scheduler = APScheduler()


# Other extensions
graphql_client = Client()
w3 = Web3()


def init_graphql_client(app):
    transport = AIOHTTPTransport(
        url=app.config["SUBGRAPH_ENDPOINT"],
    )
    graphql_client.transport = transport
    graphql_client.fetch_schema_from_transport = True


def init_logger(app):
    if app.config["ENV"] == "prod":
        app.logger.setLevel(logging.INFO)
    else:
        app.logger.setLevel(logging.DEBUG)
        app.logger.debug("Development mode")


def init_web3(app):
    w3.provider = app.config["WEB3_PROVIDER"]
    if geth_poa_middleware not in w3.middleware_onion:
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)


def init_scheduler(app):
    if app.config["SCHEDULER_ENABLED"] and app.config["ENV"] != "test":
        scheduler.init_app(app)
        scheduler.start()
