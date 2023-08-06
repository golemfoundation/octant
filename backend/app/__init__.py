from flask import Flask, g
from gql import Client
from gql.transport.aiohttp import AIOHTTPTransport

from app import settings
from app.extensions import (
    db,
    migrate,
    cors,
    socketio,
    init_logger,
    init_web3,
    api,
    init_scheduler,
)
from app.infrastructure import events, routes, apscheduler
from app.infrastructure.exception_handler import ExceptionHandler


def create_app(config_object=None):
    app = Flask(
        __name__,
        template_folder=f"{settings.config.PROJECT_ROOT}/templates",
        static_folder=f"{settings.config.PROJECT_ROOT}/static",
    )

    if config_object is not None:
        app.config.from_object(config_object)
    else:
        app.config.from_object(settings.config)

    register_extensions(app)
    register_errorhandlers(app)
    register_request_context(app)

    return app


def register_extensions(app):
    api.init_app(app)
    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)
    init_scheduler(app)
    init_logger(app)
    init_web3(app)


def register_errorhandlers(app):
    handler = ExceptionHandler()
    app.register_error_handler(Exception, handler)


def register_request_context(app):
    @app.before_request
    def initialize_graphql_client():
        client = Client()
        transport = AIOHTTPTransport(
            url=app.config["SUBGRAPH_ENDPOINT"],
        )
        client.transport = transport
        client.fetch_schema_from_transport = True
        g.graphql_client = client
