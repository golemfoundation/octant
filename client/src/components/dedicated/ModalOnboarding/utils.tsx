import { UseMutationResult } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { Fragment } from 'react';
import { Trans } from 'react-i18next';

import ButtonClaimGlm from 'components/dedicated/ButtonClaimGlm/ButtonGlmClaim';
import i18n from 'i18n';

import styles from './ModalOnboarding.module.scss';
import steps from './steps';
import stepsEpoch1 from './stepsEpoch1';
import { Step } from './types';

export const getStepsToUse = ({
  currentEpoch,
  isUserEligibleToClaimFetched,
  isUserEligibleToClaimGlm,
  glmClaimCheckValue,
  glmClaimMutation,
}: {
  currentEpoch: number | undefined;
  glmClaimCheckValue: BigNumber | undefined;
  glmClaimMutation: UseMutationResult<any, unknown, string>;
  isUserEligibleToClaimFetched: boolean;
  isUserEligibleToClaimGlm: boolean;
}): Step[] => {
  if (!isUserEligibleToClaimFetched) {
    // We need to fetch data about claiming first.
    return [];
  }
  const stepsToUse = currentEpoch === 1 ? stepsEpoch1 : steps;
  if (!isUserEligibleToClaimGlm || !glmClaimCheckValue) {
    return stepsToUse;
  }
  return [
    {
      header: i18n.t('views.onboarding.steps.claimGlm.header'),
      image: 'images/tip-withdraw.webp',
      text: (
        <Fragment>
          <Trans
            i18nKey="views.onboarding.steps.claimGlm.text"
            values={{
              value: parseInt(formatUnits(glmClaimCheckValue), 10).toString(),
            }}
          />
          <ButtonClaimGlm className={styles.buttonClaimGlm} glmClaimMutation={glmClaimMutation} />
        </Fragment>
      ),
    },
    ...steps,
  ];
};
