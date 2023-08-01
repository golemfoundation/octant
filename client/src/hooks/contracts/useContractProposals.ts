import { useMemo } from 'react';

import env from 'env';

import Proposals from './abi/Proposals.json';
import { ContractContext as ProposalsContract } from './typings/Proposals';
import web3 from './web3';

export default function useContractDeposits(): ProposalsContract {
  return useMemo(() => {
    return new web3.eth.Contract<typeof Proposals.abi>(
      Proposals.abi,
      env.contractProposalsAddress,
    ) as unknown as ProposalsContract;
  }, []);
}
