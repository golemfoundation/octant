import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';

import useContractErc20 from 'hooks/contracts/useContractErc20';

import useTokenAllowance from './useTokenAllowance';

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
  const contract = useContractErc20();
  const [approvalState, setApprovalState] = useState(ApprovalState.UNKNOWN);

  const isContractDefined = !!contract;

  useEffect(() => {
    if (!isContractDefined || !signerAddress) {
      return;
    }

    useTokenAllowance(contract, signerAddress, spender).then(allowance => {
      const allowanceBigNumber = BigNumber.from(allowance);
      const state = allowanceBigNumber.gte(minAmountToBeApproved)
        ? ApprovalState.APPROVED
        : ApprovalState.NOT_APPROVED;
      setApprovalState(state);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractDefined, signerAddress, spender, minAmountToBeApproved.toHexString()]);
  return approvalState;
}
