import { format } from 'date-fns';
import React, { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Step } from 'components/shared/ModalOnboarding/types';
import ModalOnboardingTOS from 'components/shared/ModalOnboardingTOS';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserTOS from 'hooks/queries/useUserTOS';

import { getStepsDecisionWindowOpen, getStepsDecisionWindowClosed } from './steps';

const useOnboardingSteps = (isUserTOSAcceptedInitial: boolean | undefined): Step[] => {
  const { i18n } = useTranslation();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: isUserTOSAccepted } = useUserTOS();
  const [isWaitingForFirstMultisigSignature, setIsWaitingForFirstMultisigSignature] =
    useState(false);

  const epoch = isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch;

  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();

  const changeAWDate = useMemo(() => {
    if (isDecisionWindowOpen && timeCurrentAllocationEnd) {
      return format(new Date(timeCurrentAllocationEnd).getTime(), 'dd MMM');
    }
    if (!isDecisionWindowOpen && timeCurrentEpochEnd) {
      return format(new Date(timeCurrentEpochEnd).getTime(), 'dd MMM');
    }
    return '';
  }, [isDecisionWindowOpen, timeCurrentAllocationEnd, timeCurrentEpochEnd]);

  return [
    // Once TOS accepted, remove this step from onboarding.
    ...(isUserTOSAcceptedInitial === false && isUserTOSAccepted === false
      ? [
          {
            header: isWaitingForFirstMultisigSignature
              ? i18n.t('views.onboarding.stepsCommon.signingTheTerms.header')
              : i18n.t('views.onboarding.stepsCommon.usingTheApp.header'),
            image: '/images/onboarding/octant.webp',
            text: (
              <Fragment>
                <div>
                  {isWaitingForFirstMultisigSignature
                    ? i18n.t('views.onboarding.stepsCommon.signingTheTerms.text')
                    : i18n.t('views.onboarding.stepsCommon.usingTheApp.text')}
                </div>
                <ModalOnboardingTOS
                  isWaitingForFirstMultisigSignature={isWaitingForFirstMultisigSignature}
                  setIsWaitingForFirstMultisigSignature={setIsWaitingForFirstMultisigSignature}
                />
              </Fragment>
            ),
          },
        ]
      : []),
    ...(isDecisionWindowOpen
      ? getStepsDecisionWindowOpen(epoch?.toString() ?? '', changeAWDate)
      : getStepsDecisionWindowClosed(epoch?.toString() ?? '', changeAWDate)),
  ];
};

export default useOnboardingSteps;
