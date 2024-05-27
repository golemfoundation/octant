import { UseQueryResult } from '@tanstack/react-query';
import { useAccount, useBytecode } from 'wagmi';

export default function useIsContract(): UseQueryResult<boolean | undefined, unknown> {
  const { address } = useAccount();

  return useBytecode({
    address,
  });
}
