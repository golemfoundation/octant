"""Crypto constants."""

# This is the Ethereum "burn" address. Tokens or Ether sent to this address are effectively "burned" or made
# inaccessible forever, as the private key for this address is not known and cannot be derived. It's a common
# pattern for projects to send tokens to this address if they want to reduce the supply.
BURN_ADDRESS = "0x0000000000000000000000000000000000000000"


# bytes4(keccak256("isValidSignature(bytes,bytes)")
# EIP-1271 defines a standard way for smart contracts to verify signatures. When the `isValidSignature` function
# of a contract is called and confirms the signature is valid, it returns this magic value. The value is derived
# from the first four bytes of the keccak256 hash of the string "isValidSignature(bytes,bytes)".
EIP1271_MAGIC_VALUE_BYTES = "20c13b0b"
