import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { useConfig } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';

export default function useCypressMoveToDecisionWindowOpen(): UseMutationResult<boolean, unknown> {
  const queryClient = useQueryClient();
  const wagmiConfig = useConfig();

  return useMutation({
    mutationFn: () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        if (!window.Cypress) {
          reject(new Error('useCypressMoveEpoch was called outside Cypress.'));
        }

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

        const [block, currentEpochEnd, currentEpoch] = await Promise.all([
          blockPromise,
          currentEpochEndPromise,
          currentEpochPromise,
        ]);

        if (block === undefined || currentEpoch === undefined || currentEpochEnd === undefined) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(
            new Error(
              'useCypressMoveEpoch fetched undefined block or currentEpoch or currentEpochEnd.',
            ),
          );
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
      });
    },
  });
}
