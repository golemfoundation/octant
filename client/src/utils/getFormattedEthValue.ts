import { GWEI_5, WEI_5 } from 'constants/bigInt';
import { FormattedCryptoValue } from 'types/formattedCryptoValue';

import { formatUnitsBigInt } from './formatUnitsBigInt';
import getNumberWithSpaces from './getNumberWithSpaces';
import { dotAndZeroes } from './regExp';

export type GetFormattedEthValueProps = {
  isUsingHairSpace?: boolean;
  maxNumberOfDigitsToShow?: number;
  numberOfDecimalPlaces?: number;
  shouldIgnoreGwei?: boolean;
  shouldIgnoreWei?: boolean;
  showShortFormat?: boolean;
  value: bigint;
};

export default function getFormattedEthValue({
  value,
  isUsingHairSpace = true,
  shouldIgnoreGwei = false,
  shouldIgnoreWei = false,
  numberOfDecimalPlaces = 4,
  showShortFormat = false,
  maxNumberOfDigitsToShow,
}: GetFormattedEthValueProps): FormattedCryptoValue {
  let returnObject: Omit<FormattedCryptoValue, 'fullString'>;

  const isInGweiRange = value < GWEI_5;

  const ethSuffix = showShortFormat ? 'Ξ' : 'ETH';
  const valueUnderTheRange = `<0.0001`;

  const ignoreLowValueReturnObject: FormattedCryptoValue = {
    fullString: `${valueUnderTheRange}${showShortFormat ? '' : ' '}${ethSuffix}`,
    suffix: ethSuffix,
    value: valueUnderTheRange,
  };

  if (value === 0n) {
    returnObject = { suffix: ethSuffix, value: formatUnitsBigInt(value) };
  } else if (value < WEI_5) {
    if (shouldIgnoreWei) {
      return ignoreLowValueReturnObject;
    }
    returnObject = { suffix: 'WEI', value: formatUnitsBigInt(value, 'wei') };
  } else if (isInGweiRange) {
    if (shouldIgnoreGwei) {
      return ignoreLowValueReturnObject;
    }
    returnObject = { suffix: 'GWEI', value: formatUnitsBigInt(value, 'gwei') };
  } else {
    returnObject = { suffix: ethSuffix, value: formatUnitsBigInt(value) };
  }

  let formattedValue = parseFloat(returnObject.value).toFixed(
    isInGweiRange ? 0 : numberOfDecimalPlaces,
  );

  if (maxNumberOfDigitsToShow) {
    if (formattedValue.at(0) === '0' && formattedValue.at(1) === '.') {
      formattedValue = parseFloat(formattedValue).toFixed(maxNumberOfDigitsToShow - 1);
    } else {
      formattedValue = parseFloat(formattedValue).toPrecision(maxNumberOfDigitsToShow);
    }
  }

  if (!isInGweiRange) {
    formattedValue = formattedValue.replace(dotAndZeroes, '');
  }

  formattedValue = getNumberWithSpaces(formattedValue, isUsingHairSpace);

  returnObject.value = formattedValue;

  return {
    fullString: `${formattedValue}${showShortFormat ? '' : ' '}${returnObject.suffix}`,
    ...returnObject,
  };
}
