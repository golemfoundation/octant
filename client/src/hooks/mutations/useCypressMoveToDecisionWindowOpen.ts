import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import networkConfig from 'constants/networkConfig';
import { readContractEpochs } from 'hooks/contracts/readContracts';

export default function useCypressMoveToDecisionWindowOpen(): UseMutationResult<
  boolean,
  unknown,
  any
> {
  const queryClient = useQueryClient();
  const publicClient = usePublicClient({ chainId: networkConfig.id });

  return useMutation({
    mutationFn: (isLessThan24HoursToChangeAW = false) => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        if (!window.Cypress) {
          reject(new Error('useCypressMoveToDecisionWindowOpen was called outside Cypress.'));
          return;
        }
        if (!publicClient) {
          reject(new Error('publicClient is not defined'));
          return;
        }

        const currentEpochPromise = queryClient.fetchQuery({
          queryFn: () =>
            readContractEpochs({
              functionName: 'getCurrentEpoch',
              publicClient,
            }),
          queryKey: QUERY_KEYS.currentEpoch,
        });

        const blockPromise = publicClient.getBlock();

        const currentEpochEndPromise = queryClient.fetchQuery({
          queryFn: () =>
            readContractEpochs({
              functionName: 'getCurrentEpochEnd',
              publicClient,
            }),
          queryKey: QUERY_KEYS.currentEpochEnd,
        });

        const currentEpochPropsPromise = queryClient.fetchQuery({
          queryFn: () =>
            readContractEpochs({
              functionName: 'getCurrentEpochProps',
              publicClient,
            }),
          queryKey: QUERY_KEYS.currentEpochProps,
        });

        const [block, currentEpochEnd, currentEpoch, currentEpochProps] = await Promise.all([
          blockPromise,
          currentEpochEndPromise,
          currentEpochPromise,
          currentEpochPropsPromise,
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

        const timeToIncrease =
          currentEpochEndTimestamp -
          blockTimestamp +
          (isLessThan24HoursToChangeAW ? Number(currentEpochProps.decisionWindow) - 24 * 3600 : 10); // [s]
        await publicClient.request({
          method: 'evm_increaseTime' as any,
          params: [timeToIncrease] as any,
        });
        await publicClient.request({ method: 'evm_mine' as any, params: [] as any });

        const currentEpochAfter = await queryClient.fetchQuery({
          queryFn: () =>
            readContractEpochs({
              functionName: 'getCurrentEpoch',
              publicClient,
            }),
          queryKey: QUERY_KEYS.currentEpoch,
        });

        // isEpochChanged
        resolve(Number(currentEpoch) + 1 === Number(currentEpochAfter));
      });
    },
  });
}
