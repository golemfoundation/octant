import React from 'react';
import { Trans } from 'react-i18next';

import stepOneImage from 'assets/images/onboarding/1.png';
import stepTwoImage from 'assets/images/onboarding/2.png';
import stepThreeImage from 'assets/images/onboarding/3.png';
import stepFourImage from 'assets/images/onboarding/4.png';
import Button from 'components/core/Button/Button';
import { DISCORD_LINK, OCTANT_DOCS, BLOG_POST } from 'constants/urls';
import i18n from 'i18n';

import styles from './OnboardingView.module.scss';
import { Step } from './types';

const steps: Step[] = [
  {
    header: i18n.t('views.onboarding.steps.welcomeToOctant.header'),
    image: stepOneImage,
    text: (
      <Trans
        components={[<Button href={BLOG_POST} variant="link3" />]}
        i18nKey="views.onboarding.steps.welcomeToOctant.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.steps.stakingRewards.header'),
    image: stepTwoImage,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.steps.stakingRewards.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.steps.allocateOrWithdraw.header'),
    image: stepThreeImage,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.steps.allocateOrWithdraw.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.steps.moreInformation.header'),
    image: stepFourImage,
    text: (
      <Trans
        components={[
          <span className={styles.bold} />,
          <Button href={OCTANT_DOCS} variant="link3" />,
          <Button href={DISCORD_LINK} variant="link3" />,
        ]}
        i18nKey="views.onboarding.steps.moreInformation.text"
      />
    ),
  },
];

export default steps;
