export const floatNumberWithUpTo2DecimalPlaces = /^\d+\.?(\d{1,2})?$|^\d+$/;

export const floatNumberWithUpTo9DecimalPlaces = /^\d+\.?(\d{1,9})?$|^\d+$/;

export const floatNumberWithUpTo18DecimalPlaces = /^\d+\.?(\d{1,18})?$|^\d+$/;

export const numbersOnly = /^[0-9]*$/;

export const percentageOnly = /(^100$)|(^([1-9]([0-9])?|0)$)/;

export const dotAndZeroes = /\.?0+$/;

export const comma = /,/;

export const groupingNumbersUpTo3 = /\B(?=(\d{3})+(?!\d))/g;

export const ethAddress = /0x[a-fA-F0-9]{40}/g;

export const testRegexp = /(?:^|\s)(?:epoch|Epoch|e|E)(?: ?)([0-9-]+)+/g;
