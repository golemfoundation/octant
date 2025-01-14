from v2.core.enums import ChainTypes


def compare_blockchain_types(chain_id: int, expected_chain: ChainTypes) -> bool:
    return chain_id == expected_chain
