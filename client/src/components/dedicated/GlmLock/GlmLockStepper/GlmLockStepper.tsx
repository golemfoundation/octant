import { useFormikContext } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import ProgressStepper from 'components/core/ProgressStepper/ProgressStepper';
import { FormFields } from 'components/dedicated/GlmLock/types';

import GlmLockStepperProps from './types';

const GlmLockStepper: FC<GlmLockStepperProps> = ({ currentMode, step, className }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.glmLock',
  });
  const { isValid } = useFormikContext<FormFields>();

  return (
    <BoxRounded className={className} isGrey>
      <ProgressStepper
        currentStep={step}
        isNextStepIsAvailable={isValid && step === 1}
        steps={
          currentMode === 'lock'
            ? [t('lock'), t('glmLockStepper.approve'), i18n.t('common.done')]
            : [t('unlock'), t('glmLockStepper.approve'), i18n.t('common.done')]
        }
      />
    </BoxRounded>
  );
};

export default GlmLockStepper;
