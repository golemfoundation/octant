require('dotenv').config();

const GOERLI_DEPOSIT_CONTRACT_ADDRESS = '0xff50ed3d0ec03aC01D4C79aAd74928BFF48a7b2b';
const HOLESKY_DEPOSIT_CONTRACT_ADDRESS = '0x4242424242424242424242424242424242424242';
const MAINNET_DEPOSIT_CONTRACT_ADDRESS = '0x00000000219ab540356cBB839Cbe05303d7705Fa';
const GOERLI_BATCH_DEPOSIT_CONTRACT_ADDRESS = '0x3142889E05055a80A5DC53B9B29fbFDa8626455D';
const HOLESKY_BATCH_DEPOSIT_CONTRACT_ADDRESS = '0x48b4cD1bEedaa3Cf3343ED18950BDe8815b48C52';
const MAINNET_BATCH_DEPOSIT_CONTRACT_ADDRESS = '0x1BDc639EaBF1c5EbC020Bb79E2dD069A8b6fe865';

const DEPOSIT_DATA_FILE = process.env.DEPOSIT_DATA_FILE || '';
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || '';
const HOLESKY_RPC_URL = process.env.HOLESKY_RPC_URL || '';
const TESTNET_PRIVATE_KEY =
  process.env.TESTNET_PRIVATE_KEY ||
  '0000000000000000000000000000000000000000000000000000000000000000';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

function getBatchDepositContractAddress(netname: string) {
  return process.env.BATCH_DEPOSIT_CONTRACT_ADDRESS ||
    (netname === 'goerli' && GOERLI_BATCH_DEPOSIT_CONTRACT_ADDRESS) ||
    (netname === 'holesky' && HOLESKY_BATCH_DEPOSIT_CONTRACT_ADDRESS) ||
    (netname === 'mainnet' && MAINNET_BATCH_DEPOSIT_CONTRACT_ADDRESS) ||
    '';
}

export {
  GOERLI_DEPOSIT_CONTRACT_ADDRESS,
  HOLESKY_DEPOSIT_CONTRACT_ADDRESS,
  MAINNET_DEPOSIT_CONTRACT_ADDRESS,
  GOERLI_BATCH_DEPOSIT_CONTRACT_ADDRESS,
  HOLESKY_BATCH_DEPOSIT_CONTRACT_ADDRESS,
  MAINNET_BATCH_DEPOSIT_CONTRACT_ADDRESS,
  DEPOSIT_DATA_FILE,
  TESTNET_PRIVATE_KEY,
  GOERLI_RPC_URL,
  HOLESKY_RPC_URL,
  ETHERSCAN_API_KEY,
  getBatchDepositContractAddress
};
