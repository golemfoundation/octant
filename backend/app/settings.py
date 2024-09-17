import os

from dotenv import load_dotenv
from web3 import Web3

from app.modules.common import parse_bool
from app.constants import DEFAULT_MAINNET_PROJECT_CIDS

# Load environment variables from the .env file
load_dotenv()


class Config(object):
    """Base configuration."""

    SECRET_KEY = os.getenv("OCTANT_BACKEND_SECRET_KEY")
    DEPLOYMENT_ID = os.getenv("DEPLOYMENT_ID", "unknown")
    APP_DIR = os.path.abspath(os.path.dirname(__file__))  # This directory
    PROJECT_ROOT = os.path.abspath(os.path.join(APP_DIR, os.pardir))
    TEST_DIR = os.path.abspath(os.path.join(PROJECT_ROOT, "tests"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SUBGRAPH_ENDPOINT = os.getenv("SUBGRAPH_ENDPOINT")
    SUBGRAPH_RETRY_TIMEOUT_SEC = int(os.getenv("SUBGRAPH_RETRY_TIMEOUT_SEC", 10))
    WEB3_PROVIDER = Web3.HTTPProvider(os.getenv("ETH_RPC_PROVIDER_URL"))
    ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")
    BITQUERY_API_KEY = os.getenv("BITQUERY_API_KEY")
    BITQUERY_BEARER = os.getenv("BITQUERY_BEARER")
    GC_PASSPORT_SCORER_ID = os.getenv("GC_PASSPORT_SCORER_ID")
    GC_PASSPORT_SCORER_API_KEY = os.getenv("GC_PASSPORT_SCORER_API_KEY")
    SCHEDULER_ENABLED = parse_bool(os.getenv("SCHEDULER_ENABLED"))
    DELEGATION_SALT = os.getenv("DELEGATION_SALT")
    DELEGATION_SALT_PRIMARY = os.getenv("DELEGATION_SALT_PRIMARY")

    # Smart contract addresses
    GLM_CONTRACT_ADDRESS = os.getenv("GLM_CONTRACT_ADDRESS")
    EPOCHS_CONTRACT_ADDRESS = os.getenv("EPOCHS_CONTRACT_ADDRESS")
    AUTH_CONTRACT_ADDRESS = os.getenv("AUTH_CONTRACT_ADDRESS")
    DEPOSITS_CONTRACT_ADDRESS = os.getenv("DEPOSITS_CONTRACT_ADDRESS")
    PROJECTS_CONTRACT_ADDRESS = os.getenv("PROPOSALS_CONTRACT_ADDRESS")
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
    VAULT_CONFIRM_WITHDRAWALS_ENABLED = parse_bool(
        os.getenv("VAULT_CONFIRM_WITHDRAWALS_ENABLED")
    )

    # GLM claiming
    GLM_CLAIM_ENABLED = parse_bool(os.getenv("GLM_CLAIM_ENABLED"))
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

    MAINNET_PROJECT_CIDS = os.getenv(
        "MAINNET_PROPOSAL_CIDS", DEFAULT_MAINNET_PROJECT_CIDS
    )


class ProdConfig(Config):
    """Production configuration."""

    ENV = "prod"
    PROPAGATE_EXCEPTIONS = True
    DEBUG = False
    LOG_LVL = os.getenv("OCTANT_LOG_LEVEL", "INFO")
    SQLALCHEMY_CONNECTION_POOL_SIZE = int(
        os.getenv("SQLALCHEMY_CONNECTION_POOL_SIZE", 10)
    )
    SQLALCHEMY_CONNECTION_POOL_MAX_OVERFLOW = int(
        os.getenv("SQLALCHEMY_CONNECTION_POOL_MAX_OVERFLOW", 100)
    )
    SQLALCHEMY_DATABASE_URI = os.getenv("DB_URI")
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": SQLALCHEMY_CONNECTION_POOL_SIZE,
        "max_overflow": SQLALCHEMY_CONNECTION_POOL_MAX_OVERFLOW,
        "pool_pre_ping": True,
    }
    X_REAL_IP_REQUIRED = parse_bool(os.getenv("X_REAL_IP_REQUIRED", "true"))
    CACHE_TYPE = os.getenv("CACHE_TYPE", "RedisCache")
    CACHE_REDIS_HOST = os.getenv("CACHE_REDIS_HOST")
    CACHE_REDIS_PORT = os.getenv("CACHE_REDIS_PORT")
    CACHE_REDIS_PASSWORD = os.getenv("CACHE_REDIS_PASSWORD")
    CACHE_REDIS_DB = os.getenv("CACHE_REDIS_DB")


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
    SUBGRAPH_RETRY_TIMEOUT_SEC = 2
    X_REAL_IP_REQUIRED = parse_bool(os.getenv("X_REAL_IP_REQUIRED", "false"))
    CACHE_TYPE = "SimpleCache"


class ComposeConfig(Config):
    """Dev configuration with web backend and its database running in docker-compose."""

    ENV = "dev"
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("DB_URI")
    X_REAL_IP_REQUIRED = parse_bool(os.getenv("X_REAL_IP_REQUIRED", "false"))
    CACHE_TYPE = "SimpleCache"


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
    MAINNET_PROJECT_CIDS = DEFAULT_MAINNET_PROJECT_CIDS
    DELEGATION_SALT = "salt"
    DELEGATION_SALT_PRIMARY = "salt_primary"
    SUBGRAPH_RETRY_TIMEOUT_SEC = 2
    CACHE_TYPE = "SimpleCache"


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
