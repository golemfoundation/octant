import { Response } from 'api/calls/poroposalDonors';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import { ProposalDonor } from './types';

export function mapDataToProposalDonors(data: Response): ProposalDonor[] {
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
