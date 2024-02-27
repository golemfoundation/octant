import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

export const FIAT_CURRENCIES_SYMBOLS = {
  usd: '$',
};

export const CRYPTO_CURRENCIES_TICKERS = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  golem: 'GLM',
};

export const GLM_TOTAL_SUPPLY = parseUnitsBigInt('1000000000');

export const DISPLAY_CURRENCIES = ['usd', 'aud', 'eur', 'jpy', 'cny', 'gbp'] as const;
export type DisplayCurrencies = (typeof DISPLAY_CURRENCIES)[number];
