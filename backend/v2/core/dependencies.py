from web3 import AsyncWeb3
from web3.middleware import async_geth_poa_middleware


# TODO: Cache?
def get_w3(web3_provider: str) -> AsyncWeb3:

    w3 = AsyncWeb3()
    w3.provider = web3_provider
    if async_geth_poa_middleware not in w3.middleware_onion:
        w3.middleware_onion.inject(async_geth_poa_middleware, layer=0)

    return w3

