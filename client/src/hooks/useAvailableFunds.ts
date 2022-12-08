import { BigNumberish, Signer } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';
import { formatUnits } from 'ethers/lib/utils';

import env from 'env';

import useErc20Contract from './contracts/useErc20Contract';

export default function useAvailableFunds(address: string, signer: Signer): UseQueryResult<number> {
  const { glmAddress } = env;
  const erc20Contract = useErc20Contract(glmAddress, signer);
  return useQuery<BigNumberish | undefined, unknown, number>(
    ['currentBalance'],
    () => erc20Contract?.balanceOf(address),
    {
      enabled: !!erc20Contract && !!address,
      select: response => parseInt(formatUnits(response!), 10),
    },
  );
}
