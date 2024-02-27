import React, { Fragment } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import styles from 'components/shared/ModalOnboarding/ModalOnboarding.module.scss';
import { Step } from 'components/shared/ModalOnboarding/types';
import ModalOnboardingButtonClaimGlm from 'components/shared/ModalOnboardingButtonClaimGlm';
import ModalOnboardingTOS from 'components/shared/ModalOnboardingTOS';
import useGlmClaim from 'hooks/mutations/useGlmClaim';
import useGlmClaimCheck from 'hooks/queries/useGlmClaimCheck';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';

import { stepsDecisionWindowOpen, stepsDecisionWindowClosed } from './steps';

const useOnboardingSteps = (
  isUserTOSAcceptedInitial: boolean | undefined,
  isOnboardingDone: boolean,
  onGlmClaimSuccess: () => void,
): Step[] => {
  const { i18n } = useTranslation();

  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: glmClaimCheck, isError, isFetched } = useGlmClaimCheck(isOnboardingDone);
  const glmClaimMutation = useGlmClaim(glmClaimCheck?.value, { onSuccess: onGlmClaimSuccess });

  const isUserToClaimAvailable = isFetched && !isError && !!glmClaimCheck;
  const isUserEligibleToClaimFetched = isUserToClaimAvailable || (isFetched && isError);
  // Status code 200 & value 0 is an indication that user already claimed.
  const isUserEligibleToClaimGlm = isUserToClaimAvailable && glmClaimCheck.value !== 0n;

  if (!isUserEligibleToClaimFetched) {
    // We need to fetch data about claiming first.
    return [];
  }

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
    ...(isUserEligibleToClaimGlm && glmClaimCheck?.value
      ? [
          {
            header: i18n.t('views.onboarding.stepsCommon.claimGlm.header'),
            image: 'images/tip-withdraw.webp',
            imageClassName: styles.claimGlm,
            text: (
              <Fragment>
                <Trans
                  i18nKey="views.onboarding.stepsCommon.claimGlm.text"
                  values={{
                    value: parseInt(formatUnitsBigInt(glmClaimCheck.value), 10).toString(),
                  }}
                />
                <ModalOnboardingButtonClaimGlm
                  className={styles.buttonClaimGlm}
                  glmClaimMutation={glmClaimMutation}
                />
              </Fragment>
            ),
          },
        ]
      : []),
    ...(isDecisionWindowOpen ? stepsDecisionWindowOpen : stepsDecisionWindowClosed),
  ];
};

export default useOnboardingSteps;
