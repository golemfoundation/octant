import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { Step } from 'components/shared/ModalOnboarding/types';
import ModalOnboardingTOS from 'components/shared/ModalOnboardingTOS';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

import { stepsDecisionWindowOpen, stepsDecisionWindowClosed } from './steps';

const useOnboardingSteps = (isUserTOSAcceptedInitial: boolean | undefined): Step[] => {
  const { i18n } = useTranslation();

  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

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
    ...(isDecisionWindowOpen ? stepsDecisionWindowOpen : stepsDecisionWindowClosed),
  ];
};

export default useOnboardingSteps;
