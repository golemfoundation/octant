import { FormattedCryptoValue } from 'types/formattedCryptoValue';

import getFormattedEthValue, { GetFormattedEthValueProps } from './getFormattedEthValue';
import getFormattedGlmValue, { GetFormattedGlmValueProps } from './getFormattedGlmValue';

export type GetValueCryptoToDisplayProps = {
  valueCrypto?: bigint;
  valueFiat?: string;
} & (
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
  getFormattedEthValueProps,
  getFormattedGlmValueProps,
}: GetValueCryptoToDisplayProps): FormattedCryptoValue {
  const formattedCryptoValue =
    cryptoCurrency === 'ethereum'
      ? getFormattedEthValue({ value: valueCrypto, ...getFormattedEthValueProps })
      : getFormattedGlmValue({ value: valueCrypto, ...getFormattedGlmValueProps });

  return formattedCryptoValue;
}
