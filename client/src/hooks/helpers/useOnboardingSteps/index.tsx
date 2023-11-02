import { formatUnits } from 'ethers/lib/utils';
import React, { Fragment } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ButtonClaimGlm from 'components/dedicated/ButtonClaimGlm/ButtonGlmClaim';
import styles from 'components/dedicated/ModalOnboarding/ModalOnboarding.module.scss';
import { Step } from 'components/dedicated/ModalOnboarding/types';
import TOS from 'components/dedicated/TOS/TOS';
import useGlmClaim from 'hooks/mutations/useGlmClaim';
import useGlmClaimCheck from 'hooks/queries/useGlmClaimCheck';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

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
  const isUserEligibleToClaimGlm = isUserToClaimAvailable && !glmClaimCheck.value.isZero();

  if (!isUserEligibleToClaimFetched) {
    // We need to fetch data about claiming first.
    return [];
  }

  return [
    ...(isUserTOSAcceptedInitial === false
      ? [
          {
            header: i18n.t('views.onboarding.steps.usingTheApp.header'),
            image: '/images/onboarding/octant.webp',
            text: (
              <Fragment>
                <div>{i18n.t('views.onboarding.steps.usingTheApp.text')}</div>
                <TOS />
              </Fragment>
            ),
          },
        ]
      : []),
    ...(isUserEligibleToClaimGlm && glmClaimCheck?.value
      ? [
          {
            header: i18n.t('views.onboarding.steps.claimGlm.header'),
            image: 'images/tip-withdraw.webp',
            imageClassName: styles.claimGlm,
            text: (
              <Fragment>
                <Trans
                  i18nKey="views.onboarding.steps.claimGlm.text"
                  values={{
                    value: parseInt(formatUnits(glmClaimCheck.value), 10).toString(),
                  }}
                />
                <ButtonClaimGlm
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
