import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';
import getNumberWithSpaces from 'utils/getNumberWithSpaces';
import getValueCryptoToDisplay, {
  GetValueCryptoToDisplayProps,
} from 'utils/getValueCryptoToDisplay';
import getValueFiatToDisplay, { GetValueFiatToDisplayProps } from 'utils/getValueFiatToDisplay';

export type GetValuesToDisplayProps = {
  coinPricesServerDowntimeText?: GetValueFiatToDisplayProps['coinPricesServerDowntimeText'];
  showCryptoSuffix?: boolean;
  showFiatPrefix?: GetValueFiatToDisplayProps['showFiatPrefix'];
  showLessThanOneCentFiat?: boolean;
  valueCrypto?: bigint;
  valueString?: string;
} & GetValueCryptoToDisplayProps;

export type GetValuesToDisplayReturnType = {
  cryptoSuffix?: 'WEI' | 'GWEI' | 'ETH' | 'GLM';
  primary: string;
  secondary?: string;
};

type GetValuesToDisplay = (props: GetValuesToDisplayProps) => GetValuesToDisplayReturnType;

export default function useGetValuesToDisplay(): GetValuesToDisplay {
  const {
    data: { displayCurrency, isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);

  const getValuesToDisplay: GetValuesToDisplay = ({
    coinPricesServerDowntimeText,
    valueString,
    valueCrypto = 0n,
    cryptoCurrency,
    getFormattedEthValueProps,
    getFormattedGlmValueProps,
    showCryptoSuffix = false,
    showFiatPrefix = true,
    showLessThanOneCentFiat = true,
  }) => {
    if (valueString) {
      return {
        primary: getNumberWithSpaces(parseFloat(valueString).toFixed(2)),
      };
    }

    const valueFiatToDisplay = getValueFiatToDisplay({
      coinPricesServerDowntimeText,
      cryptoCurrency,
      cryptoValues,
      displayCurrency,
      error,
      showFiatPrefix,
      showLessThanOneCent: showLessThanOneCentFiat,
      valueCrypto,
    });

    const valueCryptoToDisplay = getValueCryptoToDisplay({
      valueCrypto,
      ...(cryptoCurrency === 'ethereum'
        ? { cryptoCurrency: 'ethereum', getFormattedEthValueProps }
        : { cryptoCurrency: 'golem', getFormattedGlmValueProps }),
    });

    return isCryptoMainValueDisplay
      ? {
          cryptoSuffix: valueCryptoToDisplay.suffix,
          primary: showCryptoSuffix ? valueCryptoToDisplay.fullString : valueCryptoToDisplay.value,
          secondary: valueFiatToDisplay,
        }
      : {
          cryptoSuffix: valueCryptoToDisplay.suffix,
          primary: valueFiatToDisplay,
          secondary: showCryptoSuffix
            ? valueCryptoToDisplay.fullString
            : valueCryptoToDisplay.value,
        };
  };

  return getValuesToDisplay;
}
