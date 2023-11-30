import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';

import ModalOnboardingButtonClaimGlmProps from './types';

const ModalOnboardingButtonClaimGlm: FC<ModalOnboardingButtonClaimGlmProps> = ({
  className,
  glmClaimMutation,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.onboarding.steps.claimGlm.buttonLabel',
  });

  return (
    <Button
      className={className}
      isDisabled={glmClaimMutation.status === 'success'}
      isLoading={glmClaimMutation.isLoading}
      label={t(glmClaimMutation.status === 'success' ? 'withdrawn' : 'withdraw')}
      onClick={() => glmClaimMutation.mutateAsync('')}
      variant="cta"
    />
  );
};

export default ModalOnboardingButtonClaimGlm;
