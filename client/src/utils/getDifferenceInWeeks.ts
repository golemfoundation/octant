import differenceInWeeks from 'date-fns/differenceInWeeks';

const getDifferenceInWeeks = (fromTimestamp: number, toTimestamp: number): number =>
  Math.abs(differenceInWeeks(fromTimestamp, toTimestamp));

export default getDifferenceInWeeks;
