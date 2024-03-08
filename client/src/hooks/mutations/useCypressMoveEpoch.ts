import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { useConfig } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';

export default function useCypressMoveEpoch(): UseMutationResult<boolean, unknown, bigint> {
  const queryClient = useQueryClient();
  const wagmiConfig = useConfig();

  return useMutation({
    mutationFn: () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {

        const currentEpochPromise = queryClient.fetchQuery({
          queryFn: () =>
            readContractEpochs({
              functionName: 'getCurrentEpoch',
              publicClient: wagmiConfig.publicClient,
            }),
          queryKey: QUERY_KEYS.currentEpoch,
        });

        const blockPromise = wagmiConfig.publicClient.getBlock();

        const currentEpochEndPromise = queryClient.fetchQuery({
          queryFn: () =>
            readContractEpochs({
              functionName: 'getCurrentEpochEnd',
              publicClient: wagmiConfig.publicClient,
            }),
          queryKey: QUERY_KEYS.currentEpochEnd,
        });

        const [currentEpochEnd, block, currentEpoch] = await Promise.all([
          currentEpochEndPromise,
          blockPromise,
          currentEpochPromise,
        ]);

        if (currentEpoch === undefined || block === undefined) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('Undefined data');
        }

        const blockTimestamp = Number(block.timestamp);
        const currentEpochEndTimestamp = Number(currentEpochEnd);

        const timeToIncrease = currentEpochEndTimestamp - blockTimestamp + 10; // [s]
        await wagmiConfig.publicClient.request({
          method: 'evm_increaseTime' as any,
          params: [timeToIncrease] as any,
        });
        await wagmiConfig.publicClient.request({ method: 'evm_mine' as any, params: [] as any });

        const currentEpochAfter = await queryClient.fetchQuery({
          queryFn: () =>
            readContractEpochs({
              functionName: 'getCurrentEpoch',
              publicClient: wagmiConfig.publicClient,
            }),
          queryKey: QUERY_KEYS.currentEpoch,
        });

        // isEpochChanged
        resolve(Number(currentEpoch) + 1 === Number(currentEpochAfter));
      })
    },
  });
}
