MAINNET_VALIDATORS_ETHEREUM_ADDRESS = "0x4f80Ce44aFAb1e5E940574F135802E12ad2A5eF0"

# bytes4(keccak256("isValidSignature(bytes,bytes)")
# EIP-1271 defines a standard way for smart contracts to verify signatures. When the `isValidSignature` function
# of a contract is called and confirms the signature is valid, it returns this magic value. The value is derived
# from the first four bytes of the keccak256 hash of the string "isValidSignature(bytes,bytes)".
EIP1271_MAGIC_VALUE_BYTES = "20c13b0b"

GLM_TOTAL_SUPPLY_WEI = 1_000000000_000000000_000000000
VALIDATOR_DEPOSIT_GWEI = 32_000000000
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

BEACONCHAIN_API = "https://beaconcha.in/api"
ETHERSCAN_API = "https://api.etherscan.io/api"
BITQUERY_API = "https://graphql.bitquery.io"
SAFE_API_MAINNET = "https://safe-transaction-mainnet.safe.global/api/v1"
SAFE_API_SEPOLIA = "https://safe-transaction-sepolia.safe.global/api/v1"
