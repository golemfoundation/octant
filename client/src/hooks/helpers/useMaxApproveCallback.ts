import { BigNumber } from 'ethers';
import { useState, useCallback } from 'react';
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
): [ApprovalState, () => Promise<ApprovalState>] {
  const publicClient = usePublicClient();
  const [approvalState, setApprovalState] = useState(ApprovalState.UNKNOWN);
  const minAmountToBeApprovedHexString = minAmountToBeApproved.toHexString();

  const approveCallback = useCallback(async (): Promise<ApprovalState> => {
    return readContractERC20({
      args: [signerAddress, spender],
      functionName: 'allowance',
      publicClient,
    }).then(allowance => {
      const allowanceBigNumber = BigNumber.from(allowance);
      const state = allowanceBigNumber.gte(minAmountToBeApproved)
        ? ApprovalState.APPROVED
        : ApprovalState.NOT_APPROVED;
      setApprovalState(state);
      return state;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerAddress, spender, minAmountToBeApprovedHexString]);

  return [approvalState, approveCallback];
}
