from web3 import Web3, HTTPProvider
from web3.middleware import geth_poa_middleware

from config import settings

w3 = Web3(HTTPProvider(settings.HTTP_PROVIDER_URL))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)
w3.eth.defaultAccount = w3.eth.account.privateKeyToAccount(settings.ORACLE_MAINTAINER_PRIVATE_KEY)


def get_nonce():
    return w3.eth.getTransactionCount(settings.ORACLE_MAINTAINER_ADDRESS)


def get_latest_block():
    return w3.eth.blockNumber
