import { Response } from 'api/calls/projectDonors';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import { ProjectDonor } from './types';

export function mapDataToProjectDonors(data: Response): ProjectDonor[] {
  return data
    .reduce((acc, { address, amount }) => {
      if (amount === '0') {
        return acc;
      }
      acc.push({ address, amount: parseUnitsBigInt(amount, 'wei') });
      return acc;
    }, [] as ProjectDonor[])
    .sort((a, b) => {
      if (a.amount > b.amount) {
        return -1;
      }
      if (a.amount < b.amount) {
        return 1;
      }
      return 0;
    });
}
