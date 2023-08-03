import { UseMutationResult } from '@tanstack/react-query';

export default interface ButtonGlmClaim {
  className?: string;
  glmClaimMutation: UseMutationResult<any, unknown, string>;
}
