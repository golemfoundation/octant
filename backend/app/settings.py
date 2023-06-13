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
    TEST_DIR = os.path.abspath(os.path.join(PROJECT_ROOT, "tests"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SUBGRAPH_ENDPOINT = os.getenv("SUBGRAPH_ENDPOINT")
    WEB3_PROVIDER = Web3.HTTPProvider(os.getenv("ETH_RPC_PROVIDER_URL"))

    # Smart contract addresses
    GNT_CONTRACT_ADDRESS = os.getenv("GNT_CONTRACT_ADDRESS")
    GLM_CONTRACT_ADDRESS = os.getenv("GLM_CONTRACT_ADDRESS")
    EPOCHS_CONTRACT_ADDRESS = os.getenv("EPOCHS_CONTRACT_ADDRESS")
    PROPOSALS_CONTRACT_ADDRESS = os.getenv("PROPOSALS_CONTRACT_ADDRESS")
    WITHDRAWALS_TARGET_CONTRACT_ADDRESS = os.getenv(
        "WITHDRAWALS_TARGET_CONTRACT_ADDRESS"
    )

    CHAIN_ID = os.getenv(
        "CHAIN_ID", 11155111
    )  # 11155111 corresponds to Sepolia network


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
