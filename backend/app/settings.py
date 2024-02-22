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
    ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")
    BITQUERY_API_KEY = os.getenv("BITQUERY_API_KEY")
    BITQUERY_BEARER = os.getenv("BITQUERY_BEARER")
    SCHEDULER_ENABLED = _parse_bool(os.getenv("SCHEDULER_ENABLED"))
    CACHE_TYPE = "SimpleCache"

    # Smart contract addresses
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

    # TODO Remove this setting after the new architecture is merged
    EPOCH_2_STAKING_PROCEEDS_SURPLUS = int(
        os.getenv("EPOCH_2_STAKING_PROCEEDS_SURPLUS", 0)
    )


class ProdConfig(Config):
    """Production configuration."""

    ENV = "prod"
    PROPAGATE_EXCEPTIONS = True
    DEBUG = False
    LOG_LVL = os.getenv("OCTANT_LOG_LEVEL", "INFO")
    SQLALCHEMY_CONNECTION_POOL_SIZE = int(
        os.getenv("SQLALCHEMY_CONNECTION_POOL_SIZE", 3)
    )
    SQLALCHEMY_CONNECTION_POOL_MAX_OVERFLOW = int(
        os.getenv("SQLALCHEMY_CONNECTION_POOL_MAX_OVERFLOW", 100)
    )
    SQLALCHEMY_DATABASE_URI = os.getenv("DB_URI")
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": SQLALCHEMY_CONNECTION_POOL_SIZE,
        "max_overflow": SQLALCHEMY_CONNECTION_POOL_MAX_OVERFLOW,
    }
    X_REAL_IP_REQUIRED = _parse_bool(os.getenv("X_REAL_IP_REQUIRED", "true"))


class DevConfig(Config):
    """Development configuration."""

    ENV = "dev"
    DEBUG = True
    LOG_LVL = os.getenv("OCTANT_LOG_LEVEL", "DEBUG")
    DB_NAME = "dev.db"
    CHAIN_ID = int(os.getenv("CHAIN_ID", 1337))
    # Put the db file in project root
    DB_PATH = os.path.join(Config.PROJECT_ROOT, DB_NAME)
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_PATH}"
    X_REAL_IP_REQUIRED = _parse_bool(os.getenv("X_REAL_IP_REQUIRED", "false"))


class ComposeConfig(Config):
    """Dev configuration with web backend and its database running in docker-compose."""

    ENV = "dev"
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("DB_URI")
    X_REAL_IP_REQUIRED = _parse_bool(os.getenv("X_REAL_IP_REQUIRED", "false"))


class TestConfig(Config):
    """Test configuration."""

    ENV = "test"
    TESTING = True
    DEBUG = True
    LOG_LVL = "ERROR"
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    CHAIN_ID = 11155111
    CHAIN_NAME = "sepolia"
    GLM_WITHDRAWAL_AMOUNT = 1000_000000000_000000000
    GLM_SENDER_NONCE = 0
    # The number is calculated as 9_537357664_505573437 - 6_050000000_000000000
    # Where:
    # 9_537357664_505573437 - the amount of unclaimed and allocated under threshold
    # 6_050000000_000000000 - extra operations cost during the epoch
    EPOCH_2_STAKING_PROCEEDS_SURPLUS = 3_487357664_505573437
    WITHDRAWALS_TARGET_CONTRACT_ADDRESS = "0x1234123456123456123456123456123456123456"


def get_config():
    # Load the appropriate configuration based on the OCTANT_ENV environment variable
    env = os.getenv("OCTANT_ENV")
    if env == "production":
        return ProdConfig
    elif env == "compose":
        return ComposeConfig
    else:
        return DevConfig


config = get_config()
