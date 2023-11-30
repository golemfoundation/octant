import { parseUnits } from 'ethers/lib/utils';

import { Response } from 'api/calls/poroposalDonors';

import { ProposalDonor } from './types';

export function mapDataToProposalDonors(data: Response): ProposalDonor[] {
  return data
    .map(({ address, amount }) => ({
      address,
      amount: parseUnits(amount, 'wei'),
    }))
    .sort((a, b) => {
      if (a.amount.gt(b.amount)) {
        return 1;
      }
      if (a.amount.lt(b.amount)) {
        return -1;
      }
      return 0;
    });
}
