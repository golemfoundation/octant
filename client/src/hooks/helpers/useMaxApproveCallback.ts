import { useState, useCallback } from 'react';
import { usePublicClient } from 'wagmi';

import networkConfig from 'constants/networkConfig';
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
  minAmountToBeApproved: bigint,
): [ApprovalState, () => Promise<ApprovalState>] {
  const publicClient = usePublicClient({ chainId: networkConfig.id });
  const [approvalState, setApprovalState] = useState(ApprovalState.UNKNOWN);

  const approveCallback = useCallback(async (): Promise<ApprovalState> => {
    return readContractERC20({
      args: [signerAddress, spender],
      functionName: 'allowance',
      publicClient,
    }).then(allowance => {
      const allowanceBigInt = BigInt(allowance);
      const state =
        allowanceBigInt >= minAmountToBeApproved
          ? ApprovalState.APPROVED
          : ApprovalState.NOT_APPROVED;
      setApprovalState(state);
      return state;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerAddress, spender, minAmountToBeApproved]);

  return [approvalState, approveCallback];
}
