import { format } from 'date-fns';
import React, { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Step } from 'components/shared/ModalOnboarding/types';
import ModalOnboardingTOS from 'components/shared/ModalOnboardingTOS';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

import { getStepsDecisionWindowOpen, getStepsDecisionWindowClosed } from './steps';

import useEpochAndAllocationTimestamps from '../useEpochAndAllocationTimestamps';

const useOnboardingSteps = (isUserTOSAcceptedInitial: boolean | undefined): Step[] => {
  const { i18n } = useTranslation();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

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
    ...(isUserTOSAcceptedInitial === false
      ? [
          {
            header: i18n.t('views.onboarding.stepsCommon.usingTheApp.header'),
            image: '/images/onboarding/octant.webp',
            text: (
              <Fragment>
                <div>{i18n.t('views.onboarding.stepsCommon.usingTheApp.text')}</div>
                <ModalOnboardingTOS />
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
