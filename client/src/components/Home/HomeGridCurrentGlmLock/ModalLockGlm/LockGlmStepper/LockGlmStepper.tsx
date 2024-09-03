import { useFormikContext } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { FormFields } from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlm/types';
import BoxRounded from 'components/ui/BoxRounded';
import ProgressStepper from 'components/ui/ProgressStepper';

import LockGlmStepperProps from './types';

const LockGlmStepper: FC<LockGlmStepperProps> = ({ currentMode, step, className }) => {
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

export default LockGlmStepper;
