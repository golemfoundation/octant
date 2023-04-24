import logging

from flask_cors import CORS
from flask_migrate import Migrate
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from gql.transport.aiohttp import AIOHTTPTransport
from gql import Client

db = SQLAlchemy()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="*")
cors = CORS()
graphql_client = Client()


def init_graphql_client(app):
    transport = AIOHTTPTransport(
        url=app.config["SUBGRAPH_ENDPOINT"],
    )
    graphql_client.transport = transport
    graphql_client.fetch_schema_from_transport = True


def init_logger(app):
    if app.config['ENV'] == 'prod':
        app.logger.setLevel(logging.INFO)
    else:
        app.logger.setLevel(logging.DEBUG)
        app.logger.debug("Development mode")
