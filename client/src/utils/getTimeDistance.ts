import { differenceInSeconds, formatDistance } from 'date-fns';

import i18n from 'i18n';

const getTimeDistance = (fromTimestamp: number, toTimestamp: number): string => {
  const differenceSeconds = Math.abs(differenceInSeconds(fromTimestamp, toTimestamp));

  if (differenceSeconds < 60) {
    return i18n.t('common.lessThan1m');
  }
  return formatDistance(new Date(fromTimestamp), new Date(toTimestamp));
};

export default getTimeDistance;
