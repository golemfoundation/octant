import os

from flask import Flask

from app.engine.epochs_settings import register_epoch_settings
from app.extensions import (
    db,
    migrate,
    cors,
    socketio,
    cache,
    init_web3,
    api,
    init_scheduler,
    init_subgraph,
)
from app.infrastructure import events, routes, apscheduler  # noqa
from app.infrastructure.exception_handler import ExceptionHandler
from app.logging import init_logger
from app.modules.registry import register_services
from app.settings import ProdConfig, DevConfig


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
    register_epoch_settings()
    register_services(app)

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
    init_subgraph(app)


def register_errorhandlers(app):
    handler = ExceptionHandler()
    app.register_error_handler(Exception, handler)
