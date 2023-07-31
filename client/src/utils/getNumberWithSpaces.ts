import { groupingNumbersUpTo3 } from './regExp';

export default function getNumberWithSpaces(num: string): string {
  if (parseInt(num, 10).toString().length < 5) {return num;}
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(groupingNumbersUpTo3, '\u200a');
  return parts.join('.');
}
