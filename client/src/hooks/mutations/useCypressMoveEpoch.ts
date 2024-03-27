import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { useConfig } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';
import getCurrentEpochAndAllocationTimestamps from 'utils/getCurrentEpochAndAllocationTimestamps';

export type MoveTo = 'decisionWindowOpen' | 'decisionWindowClosed';

export default function useCypressMoveEpoch(): UseMutationResult<boolean, unknown, MoveTo> {
  const queryClient = useQueryClient();
  const wagmiConfig = useConfig();

  return useMutation({
    mutationFn: moveTo => {
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

        const currentEpochPropsPromise = queryClient.fetchQuery({
          queryFn: () =>
            readContractEpochs({
              functionName: 'getCurrentEpochProps',
              publicClient: wagmiConfig.publicClient,
            }),
          queryKey: QUERY_KEYS.currentEpochProps,
        });

        const [block, currentEpochEnd, currentEpoch, currentEpochProps] = await Promise.all([
          blockPromise,
          currentEpochEndPromise,
          currentEpochPromise,
          currentEpochPropsPromise,
        ]);

        if ([block, currentEpoch, currentEpochEnd, currentEpochProps].some(element => element === undefined)) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(
            new Error(
              'useCypressMoveEpoch fetched undefined block or currentEpoch or currentEpochEnd or currentEpochProps.',
            ),
          );
        }

        const blockTimestamp = Number(block.timestamp);
        const currentEpochEndTimestamp = Number(currentEpochEnd);
        const currentEpochPropsTimestamps = {
          decisionWindow: Number(currentEpochProps.decisionWindow) * 1000,
          duration: Number(currentEpochProps.duration) * 1000,
        }

        const currentEpochAndAllocationTimestamps = getCurrentEpochAndAllocationTimestamps({ currentEpochEnd: currentEpochEndTimestamp, currentEpochProps: currentEpochPropsTimestamps });

        const timeToIncrease = moveTo === 'decisionWindowOpen'
          ? currentEpochAndAllocationTimestamps.timeCurrentEpochEnd! - blockTimestamp + 10 // [s]
          : currentEpochAndAllocationTimestamps.timeCurrentEpochEnd! + currentEpochPropsTimestamps.decisionWindow - blockTimestamp + 10 // [s]

        await wagmiConfig.publicClient.request({
          method: 'evm_increaseTime' as any,
          params: [timeToIncrease] as any,
        });
        await wagmiConfig.publicClient.request({ method: 'evm_mine' as any, params: [] as any });

        if (moveTo === 'decisionWindowOpen') {
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
        } else {
          const isDecisionWindowOpenAfter = await queryClient.fetchQuery({
            queryFn: () =>
              readContractEpochs({
                functionName: 'isDecisionWindowOpen',
                publicClient: wagmiConfig.publicClient,
              }),
            queryKey: QUERY_KEYS.isDecisionWindowOpen,
          });

          resolve(isDecisionWindowOpenAfter === false);
        }
      });
    },
  });
}
