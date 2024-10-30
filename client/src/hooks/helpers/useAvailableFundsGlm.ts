import { useAccount, useBalance, UseBalanceReturnType } from 'wagmi';

import env from 'env';

export default function useAvailableFundsGlm(): UseBalanceReturnType<{
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
}> {
  const { address } = useAccount();
  return useBalance({
    address,
    token: env.contractGlmAddress as `0x{${string}}`,
  });
}
