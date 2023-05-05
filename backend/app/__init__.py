from flask import Flask

from app import settings
from app.exceptions import OctantException, handle_octant_exception, handle_unexpected_exception
from app.extensions import db, migrate, cors, socketio, init_graphql_client, init_logger, init_web3
from app.infrastructure import events, routes


def create_app(config_object=None):
    app = Flask(__name__)

    if config_object is not None:
        app.config.from_object(config_object)
    else:
        app.config.from_object(settings.config)

    register_extensions(app)
    register_blueprints(app)
    register_errorhandlers(app)

    return app


def register_extensions(app):
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)
    init_graphql_client(app)
    init_logger(app)
    init_web3(app)


def register_blueprints(app):
    if app.config['ENV'] != 'test':
        origins = app.config.get('CORS_ORIGIN_WHITELIST', '*')
        cors.init_app(routes.main_bp, origins=origins)
    app.register_blueprint(routes.main_bp)


def register_errorhandlers(app):
    app.errorhandler(OctantException)(handle_octant_exception)
    app.errorhandler(Exception)(handle_unexpected_exception)
