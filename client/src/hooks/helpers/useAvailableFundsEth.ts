import { useAccount, useBalance } from 'wagmi';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useAvailableFundsEth() {
  const { address } = useAccount();

  return useBalance({
    address,
    watch: true,
  });
}
