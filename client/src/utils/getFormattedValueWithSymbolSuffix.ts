import { dotAndZeroes } from 'utils/regExp';

export type FormattedValueWithSymbolSuffixInput = {
  format?: 'thousands' | 'millions' | 'thousandsAndMillions';
  precision?: number;
  value: number;
};

export default function getFormattedValueWithSymbolSuffix({
  format = 'thousands',
  value,
  precision = 0,
}: FormattedValueWithSymbolSuffixInput): string {
  let formattedValue = value;
  let suffix = '';

  const valueWithThousandSuffix = value / 1000;
  const valueWithMillionSuffix = value / 1000000;

  const isAtLeastThousandValue = valueWithThousandSuffix >= 1;
  const isAtLeastMillionValue = valueWithMillionSuffix >= 1;

  if (isAtLeastThousandValue && format !== 'millions') {
    formattedValue = valueWithThousandSuffix;
    suffix = 'K';
  }

  if (isAtLeastMillionValue && format !== 'thousands') {
    formattedValue = valueWithMillionSuffix;
    suffix = 'M';
  }

  const formattedValuePrecision = formattedValue.toFixed(precision);

  return `${
    precision !== 0 ? formattedValuePrecision.replace(dotAndZeroes, '') : formattedValuePrecision
  }${suffix}`;
}
