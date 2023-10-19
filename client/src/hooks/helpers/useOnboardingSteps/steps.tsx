import React from 'react';
import { Trans } from 'react-i18next';

import styles from 'components/dedicated/ModalOnboarding/ModalOnboarding.module.scss';
import { Step } from 'components/dedicated/ModalOnboarding/types';
import i18n from 'i18n';

const steps: Step[] = [
  {
    header: i18n.t('views.onboarding.steps.welcomeToOctant.header'),
    image: 'images/onboarding/1.webp',
    imageClassName: styles.welcomeToOctant,
    text: (
      <Trans
        components={[<span className={styles.bold} />, <span className={styles.bold} />]}
        i18nKey="views.onboarding.steps.welcomeToOctant.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.steps.earnRewards.header'),
    image: 'images/cycle.webp',
    imageClassName: styles.earnRewards,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.steps.earnRewards.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.steps.donateToProjects.header'),
    image: 'images/favourites.webp',
    imageClassName: styles.donateToProjects,
    text: (
      <Trans
        components={[<span className={styles.bold} />, <span className={styles.bold} />]}
        i18nKey="views.onboarding.steps.donateToProjects.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.steps.slideIt.header'),
    image: 'images/unlock-slider.webp',
    imageClassName: styles.slideIt,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.steps.slideIt.text"
      />
    ),
  },
];

export default steps;
