import { UseQueryResult } from '@tanstack/react-query';
import { useAccount, useBytecode } from 'wagmi';

export default function useIsContract(): UseQueryResult<string | undefined, unknown> {
  const { address } = useAccount();

  return useBytecode({
    address,
  });
}
