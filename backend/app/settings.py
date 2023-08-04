import os

from dotenv import load_dotenv
from web3 import Web3

# Load environment variables from the .env file
load_dotenv()


def _parse_bool(value: str) -> bool:
    return value.lower() in ["true", "1"] if value is not None else False


class Config(object):
    """Base configuration."""

    SECRET_KEY = os.getenv("OCTANT_BACKEND_SECRET_KEY")
    DEPLOYMENT_ID = os.getenv("DEPLOYMENT_ID", "unknown")
    APP_DIR = os.path.abspath(os.path.dirname(__file__))  # This directory
    PROJECT_ROOT = os.path.abspath(os.path.join(APP_DIR, os.pardir))
    TEST_DIR = os.path.abspath(os.path.join(PROJECT_ROOT, "tests"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SUBGRAPH_ENDPOINT = os.getenv("SUBGRAPH_ENDPOINT")
    WEB3_PROVIDER = Web3.HTTPProvider(os.getenv("ETH_RPC_PROVIDER_URL"))
    SCHEDULER_ENABLED = _parse_bool(os.getenv("SCHEDULER_ENABLED"))
    EPOCH_2_FEATURES_ENABLED = _parse_bool(os.getenv("EPOCH_2_FEATURES_ENABLED"))

    # Epoch ending dates
    EPOCH_0_END = int(os.getenv("EPOCH_0_END", 1690848000))
    EPOCH_1_END = int(os.getenv("EPOCH_1_END", 1698796800))

    # Smart contract addresses
    GNT_CONTRACT_ADDRESS = os.getenv("GNT_CONTRACT_ADDRESS")
    GLM_CONTRACT_ADDRESS = os.getenv("GLM_CONTRACT_ADDRESS")
    EPOCHS_CONTRACT_ADDRESS = os.getenv("EPOCHS_CONTRACT_ADDRESS")
    AUTH_CONTRACT_ADDRESS = os.getenv("AUTH_CONTRACT_ADDRESS")
    DEPOSITS_CONTRACT_ADDRESS = os.getenv("DEPOSITS_CONTRACT_ADDRESS")
    PROPOSALS_CONTRACT_ADDRESS = os.getenv("PROPOSALS_CONTRACT_ADDRESS")
    WITHDRAWALS_TARGET_CONTRACT_ADDRESS = os.getenv(
        "WITHDRAWALS_TARGET_CONTRACT_ADDRESS"
    )
    VAULT_CONTRACT_ADDRESS = os.getenv("VAULT_CONTRACT_ADDRESS")

    CHAIN_ID = int(
        os.getenv("CHAIN_ID", 11155111)
    )  # 11155111 corresponds to Sepolia network
    CHAIN_NAME = os.getenv("CHAIN_NAME")
    TESTNET_MULTISIG_PRIVATE_KEY = os.getenv("TESTNET_MULTISIG_PRIVATE_KEY")

    # Confirming withdrawals in Vault
    VAULT_CONFIRM_WITHDRAWALS_ENABLED = _parse_bool(
        os.getenv("VAULT_CONFIRM_WITHDRAWALS_ENABLED")
    )

    # GLM claiming
    GLM_CLAIM_ENABLED = _parse_bool(os.getenv("GLM_CLAIM_ENABLED"))
    GLM_WITHDRAWAL_AMOUNT = int(
        os.getenv("GLM_WITHDRAWAL_AMOUNT", 1000_000000000_000000000)
    )
    GLM_SENDER_ADDRESS = os.getenv("GLM_SENDER_ADDRESS")
    GLM_SENDER_PRIVATE_KEY = os.getenv("GLM_SENDER_PRIVATE_KEY")
    GLM_SENDER_NONCE = int(os.getenv("GLM_SENDER_NONCE", 0))


class ProdConfig(Config):
    """Production configuration."""

    ENV = "prod"
    PROPAGATE_EXCEPTIONS = True
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv("DB_URI")
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_size": 3, "max_overflow": 5}


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
