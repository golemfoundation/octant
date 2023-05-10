import os

from dotenv import load_dotenv
from web3 import Web3

# Load environment variables from the .env file
load_dotenv()


class Config(object):
    """Base configuration."""

    SECRET_KEY = os.getenv("OCTANT_BACKEND_SECRET_KEY", "secret-key")
    APP_DIR = os.path.abspath(os.path.dirname(__file__))  # This directory
    PROJECT_ROOT = os.path.abspath(os.path.join(APP_DIR, os.pardir))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SUBGRAPH_ENDPOINT = os.getenv(
        "SUBGRAPH_ENDPOINT", "https://octant.world/subgraphs/name/octant"
    )
    WEB3_PROVIDER = Web3.HTTPProvider(os.getenv("ETH_RPC_PROVIDER_URL"))

    # Smart contract addresses
    EPOCHS_CONTRACT_ADDRESS = os.getenv(
        "EPOCHS_CONTRACT_ADDRESS", "0xFf2cc5C9fD16dBFef0020b13CDDB59BA4D89BBBC"
    )
    PROPOSALS_CONTRACT_ADDRESS = os.getenv(
        "PROPOSALS_CONTRACT_ADDRESS", "0x17c09dA7c6Ba1Dd24AdbEB514CF8f07c9aEfd655"
    )
    CHAIN_ID = os.getenv("CHAIN_ID", 5)  # 5 corresponds to Goerli network


class ProdConfig(Config):
    """Production configuration."""

    ENV = "prod"
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DB_URI", "postgresql://user:password@localhost/octant"
    )


class DevConfig(Config):
    """Development configuration."""

    ENV = "dev"
    DEBUG = True
    DB_NAME = "dev.db"
    # Put the db file in project root
    DB_PATH = os.path.join(Config.PROJECT_ROOT, DB_NAME)
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_PATH}"


class TestConfig(Config):
    """Test configuration."""

    ENV = "test"
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite://"


def get_config():
    # Load the appropriate configuration based on the OCTANT_ENV environment variable
    env = os.getenv("OCTANT_ENV")
    if env == "production":
        return ProdConfig
    else:
        return DevConfig


config = get_config()
