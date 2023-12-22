import { UseMutationResult } from '@tanstack/react-query';

export default interface ModalOnboardingButtonClaimGlmProps {
  className?: string;
  glmClaimMutation: UseMutationResult<any, unknown, string>;
}
