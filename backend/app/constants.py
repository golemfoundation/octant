from decimal import Decimal

MAINNET_VALIDATORS_ETHEREUM_ADDRESS = "0x4f80Ce44aFAb1e5E940574F135802E12ad2A5eF0"

# bytes4(keccak256("isValidSignature(bytes,bytes)")
# EIP-1271 defines a standard way for smart contracts to verify signatures. When the `isValidSignature` function
# of a contract is called and confirms the signature is valid, it returns this magic value. The value is derived
# from the first four bytes of the keccak256 hash of the string "isValidSignature(bytes,bytes)".
EIP1271_MAGIC_VALUE_BYTES = "20c13b0b"

GLM_TOTAL_SUPPLY_WEI = 1_000000000_000000000_000000000
VALIDATOR_DEPOSIT_GWEI = 32_000000000
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
MR_FUNDING_CAP_PERCENT = Decimal("0.2")
LOW_UQ_SCORE = Decimal("0.2")
MAX_UQ_SCORE = Decimal("1.0")
UQ_THRESHOLD = 1

BEACONCHAIN_API = "https://beaconcha.in/api"
ETHERSCAN_API = "https://api.etherscan.io/api"
BITQUERY_API = "https://streaming.bitquery.io/graphql"
GC_PASSPORT_SCORER_API = "https://api.scorer.gitcoin.co"
SAFE_API_MAINNET = "https://safe-transaction-mainnet.safe.global/api/v1"
SAFE_API_SEPOLIA = "https://safe-transaction-sepolia.safe.global/api/v1"

DEFAULT_MAINNET_PROJECT_CIDS = "QmSQEFD35gKxdPEmngNt1CWe3kSwiiGqBn1Z3FZvWb8mvK,Qmds9N5y2vkMuPTD6M4EBxNXnf3bjTDmzWBGnCkQGsMMGe"

EPOCH0_SYBILS = [
    "0xde19a6ce83cc934e5d4c4573f0f026c02c984fb2",
    "0x673bb40e274786dc58fd19fbbf9ffa1f903a2fd8",
    "0x1b8da75295cf01bf23b66db1df19fd033ef9bd86",
    "0x047d26f4eeba32dbbad29078abe0974faa037266",
    "0xb57d7e4cf73e0e6383a87f23104e4f4c8b317376",
    "0x5a979491d8aeeff81846312b813e4a77779df1f9",
    "0x446966833acb28c9a6fc7b6eb463b70815a3b182",
    "0x1c1575a69a79b2d7e853e1d4e2e07979a33d4899",
    "0xbf3d49007f31d2b79635fb7372f435fb9a0c4900",
    "0x7480014c77b15aca1054af7cbb0888833326076c",
    "0x705565c4413c384721a70a0a6a646ed43c6ad7fc",
    "0xfbc8f2951d5255dcad5938557cfd505d8b9513cf",
    "0x9fa62342f6f6e494ec4fc42822611d0395faab8b",
    "0x195f7ed714986ef27463a82d017b47bf8b2a6a35",
    "0x049c9db54a3d21652546958977318966114b373b",
    "0x4343182e56b1ac756ef2fc81466c63c2bc275404",
    "0x2cbb536a8d80974f3cc91dbb8c6a1b2a5659108c",
    "0x140a50799d54e9059195b1f01ab3ec26106b161e",
    "0x92db0aa43acc43b8b685a0f46f5193bf87462df2",
    "0x46cda5eb47b88cafddbe2dfe53285b1da1d860eb",
    "0x9b7a33687e43a0c458900237ce154823a9b473b3",
    "0x36ad9923ca4b24794507d3b5fcab50f8ae616e6d",
    "0xe9f24ad877c0b3b63ed4ecfcca21f50df7e6c4d1",
    "0xa38005879daff0c35ca8c726764e020fd07ce16e",
    "0x0f76c80d5c1e0c5f118e56ac1195b6b6a8b50c8a",
    "0x2655fc09ce0336e2ba6143afa4a4ac840d98e424",
    "0x791a0f13cd2ad330a9f3dba4cf83dd606e0f0023",
    "0x8260eb7b04b1f4facf78ed90d4254fc97f9ba6a1",
    "0x1144a84e81349cf347c3bb75237741f2936795a5",
    "0x9453efe4177bfdc244ca70627c8948880c5416f3",
    "0xd285a581e4129605c13ca6d32be09d10a3579a1d",
    "0xb5dd7d81bcff4640d5f8aeec8162e5e1418aa5ba",
    "0xaf6adb966a6db512fac9606c9116aa42efdd534b",
    "0xb02ab3a052cc614460db46d32156cb0c41478c3e",
    "0x66b8390157e5afc8f42a84f34a1a12e02220fc37",
    "0xfad129ef592408085d3b1d8d61d6c676a9dfc49f",
    "0x7fd120639464401d5d7d13a9c22276169fa553e3",
    "0x992064c3065422dc7f3139645ff9f31ee0775a83",
    "0x55bc90139259ec9ab21d89be918d7b94e0faffb5",
    "0x9774c35e38ccaf1f1604cb8062c934510375b539",
    "0xbda7c5b8a747487b475468d556dcb744b4f7d240",
    "0xe43d836c07e8159a114fb8f06c1851468655dbd0",
    "0x3fc8be2b93c54eaf6cdb5ee47420e5b3c0434975",
    "0xb227220dd3479c634bacf59e99f39925628478ab",
    "0xe78d59cf340665bf7157cb600b44f3032f4c27f6",
    "0x930e299b84453732797c14fed9c0830bb8946dea",
    "0x0a4d7d043107108ec348a19a60219398e7b4fb4d",
    "0x7fbb70da8c4ee8ecf07a39f5e2b866d9b3de7238",
    "0xf7d9a2902db9829a2c51004253a3a3cfe4d1a4cc",
    "0xb06d62011c26cf0aede7cdc6c412bd367f1aa18d",
    "0xcd11c24ccd74428e6be992e78e03fa4a1cbd4d54",
    "0xc93d7cc62a21488396cdd0fe5e4fd1b721069303",
    "0x08f2aeda703348ebaadfa84723126f0927ffce62",
    "0x78117085818a049ba5ca8bfd9e8f75c849745f85",
    "0x5d8aeed55130626a473eb75bf1301ce3199c85b4",
    "0x934775ce4466a38226cb593895a7fda112c9b1e0",
    "0x843ea4d5b8b34e07a63d256785a1c9560f3ea2bc",
    "0xea809d3fb969d1d4de90c022c34b075b1fa5ec50",
]
