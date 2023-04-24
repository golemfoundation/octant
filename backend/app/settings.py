import os


class Config(object):
    """Base configuration."""

    SECRET_KEY = os.getenv('OCTANT_BACKEND_SECRET_KEY', 'secret-key')
    APP_DIR = os.path.abspath(os.path.dirname(__file__))  # This directory
    PROJECT_ROOT = os.path.abspath(os.path.join(APP_DIR, os.pardir))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SUBGRAPH_ENDPOINT = os.getenv('SUBGRAPH_ENDPOINT', 'https://octant.world/subgraphs/name/octant')


class ProdConfig(Config):
    """Production configuration."""

    ENV = 'prod'
    DEBUG = False
    username = os.getenv('DB_USERNAME', 'user')
    password = os.getenv('DB_PASSWORD', 'password')
    hostname = os.getenv('DB_HOST', 'localhost')
    dbname = os.getenv('DB_NAME', 'octant')
    SQLALCHEMY_DATABASE_URI = f"postgresql://{username}:{password}@{hostname}/{dbname}"


class DevConfig(Config):
    """Development configuration."""

    ENV = 'dev'
    DEBUG = True
    DB_NAME = 'dev.db'
    # Put the db file in project root
    DB_PATH = os.path.join(Config.PROJECT_ROOT, DB_NAME)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///{0}'.format(DB_PATH)


class TestConfig(Config):
    """Test configuration."""

    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'
