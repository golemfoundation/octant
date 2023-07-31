import { MaxUint256 } from '@ethersproject/constants';
import { TransactionReceipt } from 'ethereum-abi-types-generator';
import { BigNumber } from 'ethers';
import { useCallback, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

import useContractErc20 from 'hooks/contracts/useContractErc20';

import useTokenAllowance from './useTokenAllowance';

// eslint-disable-next-line no-shadow
export enum ApprovalState {
  APPROVED = 'APPROVED',
  NOT_APPROVED = 'NOT_APPROVED',
  UNKNOWN = 'UNKNOWN',
}

function useApprovalState(
  contract: any | null,
  signerAddress: string | undefined,
  spender: string,
  minAmountToBeApproved: BigNumber,
): ApprovalState {
  const [approvalState, setApprovalState] = useState(ApprovalState.UNKNOWN);

  useEffect(() => {
    if (contract && signerAddress) {
      useTokenAllowance(contract, signerAddress, spender).then(allowance => {
        const allowanceBigNumber = BigNumber.from(allowance);
        const state = allowanceBigNumber.gte(minAmountToBeApproved)
          ? ApprovalState.APPROVED
          : ApprovalState.NOT_APPROVED;
        setApprovalState(state);
      });
    }
  }, [contract, signerAddress, spender, minAmountToBeApproved]);
  return approvalState;
}

export default function useMaxApproveCallback(
  minAmountToBeApproved: BigNumber,
  spender: string,
  signerAddress?: string,
): [ApprovalState, () => Promise<TransactionReceipt>] {
  const contract = useContractErc20();
  const { address } = useAccount();

  const approvalState = useApprovalState(contract, signerAddress, spender, minAmountToBeApproved);
  const approveCallback = useCallback(async (): Promise<TransactionReceipt> => {
    if (!contract) {
      return Promise.reject();
    }

    return contract.methods
      .approve(spender, MaxUint256.toString())
      .send({ from: address as `0x${string}` })
      .catch((error: Error) => {
        // eslint-disable-next-line no-console
        console.warn(`Failed to approve max amount for token ${contract.address}`, error);
        throw error;
      });
  }, [address, contract, spender]);

  return [approvalState, approveCallback];
}
