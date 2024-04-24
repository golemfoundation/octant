import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useRef } from 'react';

import { PostCalculateRewardsResponse, apiPostCalculateRewards } from 'api/calls/calculateRewards';

type CalculateRewardsArguments = {
  amountGlm: string;
  numberOfEpochs: number;
};

export default function useCalculateRewards(
  options?: UseMutationOptions<any, unknown, CalculateRewardsArguments>,
): UseMutationResult<PostCalculateRewardsResponse, unknown, CalculateRewardsArguments> {
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ amountGlm, numberOfEpochs }) => {
      abortControllerRef.current = new AbortController();
      return apiPostCalculateRewards(amountGlm, numberOfEpochs, abortControllerRef.current.signal);
    },
    ...options,
  });

  const reset = () => {
    abortControllerRef.current?.abort();
    mutation.reset();
  };

  return { ...mutation, reset };
}
