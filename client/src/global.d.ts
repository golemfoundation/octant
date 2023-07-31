import Web3, { SupportedProviders } from 'web3';

declare global {
  interface Window {
    ethereum?: SupportedProviders;
    web3?: Web3;
  }
}
