export const floatNumberWithUpTo2DecimalPlaces = /^\d+\.?(\d{1,2})?$|^\d+$/;

export const floatNumberWithUpTo18DecimalPlaces = /^\d+\.?(\d{1,18})?$|^\d+$/;

export const numbersOnly = /^[0-9]*$/;

export const percentageOnly = /(^100$)|(^([1-9]([0-9])?|0)$)/;

export const dotAndZeroes = /\.?0+$/;

export const comma = /,/;

export const groupingNumbersUpTo3 = /\B(?=(\d{3})+(?!\d))/g;
