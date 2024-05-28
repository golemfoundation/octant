import { type UsePublicClientReturnType } from 'wagmi';

import env from 'env';

import Deposits from './abi/Deposits.json';
import Epochs from './abi/Epochs.json';
import ERC20 from './abi/ERC20.json';
import Proposals from './abi/Proposals.json';

type ReadContract = {
  args?: unknown[];
  functionName: string;
  publicClient: UsePublicClientReturnType;
};
export function readContractERC20({
  publicClient,
  functionName,
  args,
}: ReadContract): Promise<any> {
  return publicClient!.readContract({
    abi: ERC20.abi,
    address: env.contractGlmAddress as `0x{string}`,
    args,
    functionName,
  });
}

export function readContractEpochs({
  publicClient,
  functionName,
  args,
}: ReadContract): Promise<any> {
  return publicClient!.readContract({
    abi: Epochs.abi,
    address: env.contractEpochsAddress as `0x{string}`,
    args,
    functionName,
  });
}

export function readContractDeposits({
  publicClient,
  functionName,
  args,
}: ReadContract): Promise<any> {
  return publicClient!.readContract({
    abi: Deposits.abi,
    address: env.contractDepositsAddress as `0x{string}`,
    args,
    functionName,
  });
}

export function readContractProposals({
  publicClient,
  functionName,
  args,
}: ReadContract): Promise<any> {
  return publicClient!.readContract({
    abi: Proposals.abi,
    address: env.contractProposalsAddress as `0x{string}`,
    args,
    functionName,
  });
}
