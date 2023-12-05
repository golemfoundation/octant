import React from 'react';
import { Trans } from 'react-i18next';

import styles from 'components/shared/ModalOnboarding/ModalOnboarding.module.scss';
import { Step } from 'components/shared/ModalOnboarding/types';
import i18n from 'i18n';

export const stepsDecisionWindowOpen: Step[] = [
  {
    header: i18n.t('views.onboarding.stepsDecisionWindowOpen.welcomeToOctant.header'),
    image: 'images/onboarding/1.webp',
    imageClassName: styles.welcomeToOctant,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsDecisionWindowOpen.welcomeToOctant.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.stepsDecisionWindowOpen.earnRewards.header'),
    image: 'images/cycle.webp',
    imageClassName: styles.earnRewards,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsDecisionWindowOpen.earnRewards.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.stepsDecisionWindowOpen.donateToProjects.header'),
    image: 'images/favourites.webp',
    imageClassName: styles.donateToProjects,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsDecisionWindowOpen.donateToProjects.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.stepsDecisionWindowOpen.slideIt.header'),
    image: 'images/unlock-slider.webp',
    imageClassName: styles.slideIt,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsDecisionWindowOpen.slideIt.text"
      />
    ),
  },
];

export const stepsDecisionWindowClosed: Step[] = [
  {
    header: i18n.t('views.onboarding.stepsDecisionWindowClosed.welcomeToOctant.header'),
    image: 'images/onboarding/1.webp',
    imageClassName: styles.welcomeToOctant,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsDecisionWindowClosed.welcomeToOctant.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.stepsDecisionWindowClosed.earnRewards.header'),
    image: 'images/onboarding/earn-rewards.webp',
    imageClassName: styles.earnRewards,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsDecisionWindowClosed.earnRewards.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.stepsDecisionWindowClosed.getInvolved.header'),
    image: 'images/onboarding/get-involved.webp',
    imageClassName: styles.slideIt,
    text: <Trans i18nKey="views.onboarding.stepsDecisionWindowClosed.getInvolved.text" />,
  },
];
