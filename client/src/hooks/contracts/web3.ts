import Web3, { HttpProvider, SupportedProviders, EthExecutionAPI } from 'web3';

import { ALCHEMY_API_URL } from 'constants/urls';
import env from 'env';

const getProvider = (): SupportedProviders<EthExecutionAPI> => {
  /**
   * "Web3.providers.givenProvider" should be set if in an Ethereum supported browser.
   * It's not true on all browsers. E.g. Metamask prevents it from being set.
   */
  if (Web3.givenProvider) {
    return Web3.givenProvider;
  }
  /**
   * window.ethereum is the newest standard of setting provider by a wallet (EIP-11993).
   * https://eips.ethereum.org/EIPS/eip-1193
   * Most wallets use it.
   */
  if (window.ethereum) {
    return window.ethereum;
  }
  /**
   * Current provider is a predecessor of window.ethereum,
   * possibly still used by some old browsers.
   */
  if (window.web3?.currentProvider) {
    return window.web3.currentProvider;
  }
  /**
   * When user doesn't have any provider, we provide Alchemy provider.
   */
  return new HttpProvider(`${ALCHEMY_API_URL}/${env.alchemyId}`);
};

// "Web3.providers.givenProvider" will be set if in an Ethereum supported browser.
export const web3 = new Web3(getProvider());
