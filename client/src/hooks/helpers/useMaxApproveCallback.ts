import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';

import { readContractERC20 } from 'hooks/contracts/readContracts';

// eslint-disable-next-line no-shadow
export enum ApprovalState {
  APPROVED = 'APPROVED',
  NOT_APPROVED = 'NOT_APPROVED',
  UNKNOWN = 'UNKNOWN',
}

export default function useApprovalState(
  signerAddress: string | undefined,
  spender: string,
  minAmountToBeApproved: BigNumber,
): ApprovalState {
  const publicClient = usePublicClient();
  const [approvalState, setApprovalState] = useState(ApprovalState.UNKNOWN);

  useEffect(() => {
    if (!signerAddress) {
      return;
    }

    readContractERC20({
      args: [signerAddress, spender],
      functionName: 'allowance',
      publicClient,
    }).then(allowance => {
      const allowanceBigNumber = BigNumber.from(allowance);
      const state = allowanceBigNumber.gte(minAmountToBeApproved)
        ? ApprovalState.APPROVED
        : ApprovalState.NOT_APPROVED;
      setApprovalState(state);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerAddress, spender, minAmountToBeApproved.toHexString()]);
  return approvalState;
}
