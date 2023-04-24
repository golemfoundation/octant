import os

from flask import Flask

from app.settings import ProdConfig, DevConfig, TestConfig
from app.exceptions import OctantException, handle_octant_exception, handle_unexpected_exception

from app import history
from app.graphql import get_locks, get_unlocks
from app.extensions import db, migrate, cors, socketio, init_graphql_client, init_logger
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()


def create_app():
    app = Flask(__name__)
    config = __get_config()
    app.config.from_object(config)

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


def register_blueprints(app):
    origins = app.config.get('CORS_ORIGIN_WHITELIST', '*')
    cors.init_app(history.routes.blueprint, origins=origins)
    app.register_blueprint(history.routes.blueprint)


def register_errorhandlers(app):
    app.errorhandler(OctantException)(handle_octant_exception)
    app.errorhandler(Exception)(handle_unexpected_exception)


def __get_config():
    # Load the appropriate configuration based on the OCTANT_ENV environment variable
    env = os.getenv('OCTANT_ENV')
    if env == 'production':
        return ProdConfig
    elif env == 'testing':
        return TestConfig
    else:
        return DevConfig
