class ChainTypes:
    MAINNET = 1
    LOCAL = 1337
    SEPOLIA = 11155111


def compare_blockchain_types(chain_id: int, expected_chain: ChainTypes) -> bool:
    return chain_id == expected_chain
