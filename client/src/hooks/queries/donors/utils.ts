import { Response } from 'api/calls/projectDonors';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import { ProjectDonor } from './types';

export function mapDataToProjectDonors(data: Response): ProjectDonor[] {
  return data
    .map(({ address, amount }) => ({
      address,
      amount: parseUnitsBigInt(amount, 'wei'),
    }))
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
