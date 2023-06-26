import { useAccount, useBalance } from 'wagmi';

import env from 'env';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useAvailableFundsGlm() {
  const { address } = useAccount();

  return useBalance({
    address,
    token: env.contracts.glmAddress as `0x{${string}}`,
    watch: true,
  });
}
