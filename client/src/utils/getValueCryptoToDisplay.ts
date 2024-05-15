import getFormattedEthValue, { GetFormattedEthValueProps } from './getFormattedEthValue';
import getFormattedGlmValue, { GetFormattedGlmValueProps } from './getFormattedGlmValue';

export type GetValueCryptoToDisplayProps = { showCryptoSuffix?: boolean; valueCrypto?: bigint } & (
  | {
      cryptoCurrency: 'ethereum';
      getFormattedEthValueProps?: Omit<GetFormattedEthValueProps, 'value'>;
      getFormattedGlmValueProps?: never;
    }
  | {
      cryptoCurrency: 'golem';
      getFormattedEthValueProps?: never;
      getFormattedGlmValueProps?: Omit<GetFormattedGlmValueProps, 'value'>;
    }
);

export default function getValueCryptoToDisplay({
  cryptoCurrency,
  valueCrypto = BigInt(0),
  showCryptoSuffix = true,
  getFormattedEthValueProps,
  getFormattedGlmValueProps,
}: GetValueCryptoToDisplayProps): string {
  const formattedCryptoValue =
    cryptoCurrency === 'ethereum'
      ? getFormattedEthValue({ value: valueCrypto, ...getFormattedEthValueProps })
      : getFormattedGlmValue({ value: valueCrypto, ...getFormattedGlmValueProps });

  if (showCryptoSuffix) {
    return formattedCryptoValue.fullString;
  }
  return formattedCryptoValue.value;
}
