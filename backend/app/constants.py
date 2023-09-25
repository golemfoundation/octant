# This is the Ethereum "burn" address. Tokens or Ether sent to this address are effectively "burned" or made
# inaccessible forever, as the private key for this address is not known and cannot be derived. It's a common
# pattern for projects to send tokens to this address if they want to reduce the supply.
BURN_ADDRESS = "0x0000000000000000000000000000000000000000"
MAINNET_VALIDATORS_ETHEREUM_ADDRESS = "0x4f80Ce44aFAb1e5E940574F135802E12ad2A5eF0"

# bytes4(keccak256("isValidSignature(bytes,bytes)")
# EIP-1271 defines a standard way for smart contracts to verify signatures. When the `isValidSignature` function
# of a contract is called and confirms the signature is valid, it returns this magic value. The value is derived
# from the first four bytes of the keccak256 hash of the string "isValidSignature(bytes,bytes)".
EIP1271_MAGIC_VALUE_BYTES = "20c13b0b"


GLM_TOTAL_SUPPLY_WEI = 1_000000000_000000000_000000000

# TODO call an API to get a real value instead of hardcoding: https://linear.app/golemfoundation/issue/OCT-902/api-call-to-get-validators-api
ESTIMATED_STAKING_APR = 0.0345

# TODO consider calling API to get this value: https://linear.app/golemfoundation/issue/OCT-901/cache-a-call-to-beaconchain-on-external-api-level
ESTIMATED_STAKED_AMOUNT = 100000_000000000_000000000
