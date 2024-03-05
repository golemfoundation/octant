import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

import { PostCalculateRewardsResponse, apiPostCalculateRewards } from 'api/calls/calculateRewards';

type CalculateRewardsArguments = {
  amountGlm: string;
  numberOfDays: number;
};

export default function useCalculateRewards(
  options?: UseMutationOptions<any, unknown, CalculateRewardsArguments>,
): UseMutationResult<PostCalculateRewardsResponse, unknown, CalculateRewardsArguments> {
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ amountGlm, numberOfDays }) => {
      abortControllerRef.current = new AbortController();
      return apiPostCalculateRewards(amountGlm, numberOfDays, abortControllerRef.current.signal);
    },
    ...options,
  });

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    mutation.reset();
  }, [abortControllerRef, mutation]);

  return { ...mutation, reset };
}
