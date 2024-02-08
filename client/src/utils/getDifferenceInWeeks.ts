import { differenceInWeeks } from 'date-fns';

const getDifferenceInWeeks = (fromTimestamp: number, toTimestamp: number): number =>
  Math.abs(differenceInWeeks(fromTimestamp, toTimestamp));

export default getDifferenceInWeeks;
