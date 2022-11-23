from os import path, getenv

import dotenv

PROJECT_DIR = path.abspath(path.dirname(__file__))
ROOT_DIR = path.abspath(path.dirname(__file__) + "/..")
ENV_PATH = path.join(PROJECT_DIR, ".env")

defaults = {
    "HTTP_PROVIDER_URL": "http://127.0.0.1:8545",
    "BEACONCHAIN_API_URL": "http://localhost:8888",
    "ALCHEMY_API_URL": "http://localhost:8888/alchemy/rpc",
    "ORACLE_MAINTAINER_ADDRESS": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "ORACLE_MAINTAINER_PRIVATE_KEY": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "EPOCHS_CONTRACT_DEF": path.join(PROJECT_DIR, "artifacts/contracts/Epochs.sol/Epochs.json"),
    "EPOCHS_CONTRACT_ADDRESS": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "BEACONCHAIN_ORACLE_CONTRACT_DEF": path.join(PROJECT_DIR, "artifacts/contracts/oracle/BeaconChainOracle.sol/BeaconChainOracle.json"),
    "BEACONCHAIN_ORACLE_CONTRACT_ADDRESS": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    "EXECUTION_LAYER_ORACLE_CONTRACT_DEF": path.join(PROJECT_DIR, "artifacts/contracts/oracle/ExecutionLayerOracle.sol/ExecutionLayerOracle.json"),
    "EXECUTION_LAYER_ORACLE_CONTRACT_ADDRESS": "0x0165878A594ca255338adfa4d48449f69242Eb8F"
}


class Settings:

    def __init__(self):
        dotenv.load_dotenv(ENV_PATH)

    def __getattribute__(self, name):
        default = defaults.get(name)
        if getenv(name, default) != dotenv.get_key(ENV_PATH, name):
            dotenv.load_dotenv(ENV_PATH, override=True)
        return getenv(name, default)

    def __setattr__(self, item, value):
        dotenv.set_key(ENV_PATH, item, value)
        dotenv.load_dotenv(ENV_PATH, override=True)


settings = Settings()
