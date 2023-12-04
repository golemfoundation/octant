import os

from flask import Flask, g
from gql import Client
from gql.transport.requests import RequestsHTTPTransport

from app.extensions import (
    db,
    migrate,
    cors,
    socketio,
    cache,
    init_web3,
    api,
    init_scheduler,
)
from app.logging import init_logger
from app.infrastructure import events, routes, apscheduler  # noqa
from app.infrastructure.exception_handler import ExceptionHandler
from app.settings import ProdConfig, DevConfig

from app.core.epochs.epochs_registry import EpochsRegistry
from app.core.rewards.all_proceeds_with_op_cost_rewards_strategy import (
    AllProceedsWithOperationalCostStrategy,
)
from app.core.rewards.standard_rewards_strategy import StandardRewardsStrategy
from app.core.deposits.weighted_deposits.timebased_calculator import (
    TimebasedWeightsCalculator,
)
from app.core.deposits.weighted_deposits.timebased_without_unlocks_calculator import (
    TimebasedWithoutUnlocksWeightsCalculator,
)
from app.v2.engine.epochs_settings import register_epoch_settings


def create_app(config=None):
    if config is None:
        env = os.getenv("OCTANT_ENV")
        config = ProdConfig if env == "production" else DevConfig

    app = Flask(
        __name__,
        template_folder=f"{config.PROJECT_ROOT}/templates",
        static_folder=f"{config.PROJECT_ROOT}/static",
    )
    app.config.from_object(config)

    register_extensions(app)
    register_errorhandlers(app)
    register_request_context(app)
    register_epoch_settings()

    return app


def register_extensions(app):
    api.init_app(app)
    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)
    cache.init_app(app)
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
        transport = RequestsHTTPTransport(
            url=app.config["SUBGRAPH_ENDPOINT"], timeout=2
        )
        client.transport = transport
        client.fetch_schema_from_transport = True
        g.graphql_client = client
