import { formatUnits } from 'ethers/lib/utils';
import React, { Fragment } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ButtonClaimGlm from 'components/dedicated/ButtonClaimGlm/ButtonGlmClaim';
import styles from 'components/dedicated/ModalOnboarding/ModalOnboarding.module.scss';
import { Step } from 'components/dedicated/ModalOnboarding/types';
import TOS from 'components/dedicated/TOS/TOS';
import useGlmClaim from 'hooks/mutations/useGlmClaim';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useGlmClaimCheck from 'hooks/queries/useGlmClaimCheck';

import defaultSteps from './steps';
import stepsEpoch1 from './stepsEpoch1';

const useOnboardingSteps = (
  isUserTOSAcceptedInitial: boolean | undefined,
  isOnboardingDone: boolean,
): Step[] => {
  const { i18n } = useTranslation();

  const { data: currentEpoch } = useCurrentEpoch();
  const { data: glmClaimCheck, isError, isFetched } = useGlmClaimCheck(isOnboardingDone);
  const glmClaimMutation = useGlmClaim(glmClaimCheck?.value);

  const isUserToClaimAvailable = isFetched && !isError && !!glmClaimCheck;
  const isUserEligibleToClaimFetched = isUserToClaimAvailable || (isFetched && isError);
  // Status code 200 & value 0 is an indication that user already claimed.
  const isUserEligibleToClaimGlm = isUserToClaimAvailable && !glmClaimCheck.value.isZero();

  if (!isUserEligibleToClaimFetched) {
    // We need to fetch data about claiming first.
    return [];
  }

  const steps = [
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
    ...(currentEpoch === 1 ? stepsEpoch1 : defaultSteps),
  ];

  return steps;
};

export default useOnboardingSteps;
