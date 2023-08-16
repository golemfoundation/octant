import { groupingNumbersUpTo3 } from './regExp';

export default function getNumberWithSpaces(number: string, isUsingHairSpace = true): string {
  if (parseInt(number, 10).toString().length < 5) {
    return number;
  }
  const parts = number.toString().split('.');
  parts[0] = parts[0].replace(groupingNumbersUpTo3, isUsingHairSpace ? '\u200a' : ' ');
  return parts.join('.');
}
