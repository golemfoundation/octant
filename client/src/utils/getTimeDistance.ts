import { differenceInSeconds } from 'date-fns';
import formatDistance from 'date-fns/formatDistance';

const getTimeDistance = (fromTimestamp: number, toTimestamp: number): string => {
  const differenceSeconds = Math.abs(differenceInSeconds(fromTimestamp, toTimestamp));

  if (differenceSeconds < 60) {return 'less than 1m';}
  return formatDistance(new Date(fromTimestamp), new Date(toTimestamp));
};

export default getTimeDistance;
