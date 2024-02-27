import { getTime, startOfDay } from 'date-fns';
import { sortBy, uniq } from 'lodash';

import { formatUnitsBigInt } from './formatUnitsBigInt';
import { parseUnitsBigInt } from './parseUnitsBigInt';

export type GroupedGlmAmountByDateItem = {
  cumulativeGlmAmount: number;
  dateTime: number;
};

export type GroupedUsersByDateItem = {
  dateTime: number;
  users: `0x${string}`[];
};

type GroupedByDate = GroupedGlmAmountByDateItem[] | GroupedUsersByDateItem[];

const getMetricsChartDataGroupedByDate = (
  data: any[],
  dataType: 'lockeds' | 'lockedSummarySnapshots',
): GroupedByDate =>
  sortBy(data, l => l.timestamp).reduce((acc, curr) => {
    // grouping by start of day in user's timezone
    const dateTime = getTime(startOfDay(curr.timestamp * 1000));

    const idx = acc.findIndex(v => v.dateTime === dateTime);
    if (idx < 0) {
      acc.push({
        dateTime,
        ...(dataType === 'lockeds'
          ? {
              users: acc.length > 0 ? uniq([...acc[acc.length - 1].users, curr.user]) : [curr.user],
            }
          : {
              // formatting from WEI to GLM (int)
              cumulativeGlmAmount: parseFloat(
                formatUnitsBigInt(parseUnitsBigInt(curr.lockedTotal, 'wei')),
              ),
            }),
      });
      return acc;
    }

    if (dataType === 'lockeds') {
      // eslint-disable-next-line operator-assignment
      acc[idx].users = uniq([...acc[idx].users, curr.user]);
    } else {
      // formatting from WEI to GLM (int)
      // eslint-disable-next-line operator-assignment
      acc[idx].cumulativeGlmAmount = parseFloat(
        formatUnitsBigInt(parseUnitsBigInt(curr.lockedTotal, 'wei')),
      );
    }

    return acc;
  }, []);

export default getMetricsChartDataGroupedByDate;
