export const FIAT_CURRENCIES_SYMBOLS = {
  usd: '$',
};

export const CRYPTO_CURRENCIES_TICKERS = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  golem: 'GLM',
};

export const DISPLAY_CURRENCIES = ['usd', 'aud', 'eur', 'jpy', 'cny', 'gbp'];
export type DisplayCurrencies = (typeof DISPLAY_CURRENCIES)[number];
