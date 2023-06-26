import formatDistance from 'date-fns/formatDistance';

const getTimeDistance = (fromTimestamp: number, toTimestamp: number): string =>
  formatDistance(new Date(fromTimestamp), new Date(toTimestamp));

export default getTimeDistance;
