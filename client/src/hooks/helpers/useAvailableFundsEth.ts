import { useAccount, useBalance, UseBalanceReturnType } from 'wagmi';

export default function useAvailableFundsEth(): UseBalanceReturnType<{
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
}> {
  const { address } = useAccount();
  return useBalance({
    address,
  });
}
