import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAccount, useBalance, useBlockNumber, UseBalanceReturnType } from 'wagmi';

import networkConfig from 'constants/networkConfig';
import env from 'env';

export default function useAvailableFundsEth(): UseBalanceReturnType<{
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
}> {
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({
    chainId: networkConfig.id,
    watch: true,
  });
  const queryClient = useQueryClient();
  const balance = useBalance({
    address,
  });

  /**
   * In local environment blocks are mined very fast, flooding the logs.
   * Hence, disable refetch on each block.
   */
  const isCypressLocalRun = env.network === 'Local' && !!window.Cypress;

  // balance.queryKey is an array. Stingifying it is required for useEffect to compare it.
  const balanceQueryKeyStringified = JSON.stringify(balance.queryKey);

  useEffect(() => {
    if (isCypressLocalRun) {
      return;
    }
    queryClient.invalidateQueries({ queryKey: balance.queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCypressLocalRun, blockNumber, balanceQueryKeyStringified]);

  return balance;
}
