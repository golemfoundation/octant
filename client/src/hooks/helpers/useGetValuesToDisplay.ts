import useCryptoValues from 'hooks/queries/useCryptoValues';
import useSettingsStore from 'store/settings/store';
import getNumberWithSpaces from 'utils/getNumberWithSpaces';
import getValueCryptoToDisplay, {
  GetValueCryptoToDisplayProps,
} from 'utils/getValueCryptoToDisplay';
import getValueFiatToDisplay, { GetValueFiatToDisplayProps } from 'utils/getValueFiatToDisplay';

type GetValuesToDisplayProps = {
  coinPricesServerDowntimeText?: GetValueFiatToDisplayProps['coinPricesServerDowntimeText'];
  showLessThanOneCentFiat?: boolean;
  valueCrypto?: bigint;
  valueString?: string;
} & GetValueCryptoToDisplayProps;

type GetValuesToDisplay = (props: GetValuesToDisplayProps) => {
  primary: string;
  secondary?: string;
};

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
      showLessThanOneCent: showLessThanOneCentFiat,
      valueCrypto,
    });

    const valueCryptoToDisplay = getValueCryptoToDisplay({
      showCryptoSuffix,
      valueCrypto,
      ...(cryptoCurrency === 'ethereum'
        ? { cryptoCurrency: 'ethereum', getFormattedEthValueProps }
        : { cryptoCurrency: 'golem', getFormattedGlmValueProps }),
    });

    return isCryptoMainValueDisplay
      ? {
          primary: valueCryptoToDisplay,
          secondary: valueFiatToDisplay,
        }
      : {
          primary: valueFiatToDisplay,
          secondary: valueCryptoToDisplay,
        };
  };

  return getValuesToDisplay;
}
