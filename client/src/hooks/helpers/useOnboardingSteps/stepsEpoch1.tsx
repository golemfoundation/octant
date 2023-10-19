import React from 'react';
import { Trans } from 'react-i18next';

import styles from 'components/dedicated/ModalOnboarding/ModalOnboarding.module.scss';
import { Step } from 'components/dedicated/ModalOnboarding/types';
import i18n from 'i18n';

const stepsEpoch1: Step[] = [
  {
    header: i18n.t('views.onboarding.stepsEpoch1.welcomeToOctant.header'),
    image: 'images/onboarding/1.webp',
    imageClassName: styles.welcomeToOctant,
    text: (
      <Trans
        components={[<span className={styles.bold} />, <span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsEpoch1.welcomeToOctant.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.stepsEpoch1.earnRewards.header'),
    image: 'images/cycle.webp',
    imageClassName: styles.earnRewards,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsEpoch1.earnRewards.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.stepsEpoch1.donateToProjects.header'),
    image: 'images/favourites.webp',
    imageClassName: styles.donateToProjects,
    text: (
      <Trans
        components={[<span className={styles.bold} />, <span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsEpoch1.donateToProjects.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.stepsEpoch1.slideIt.header'),
    image: 'images/unlock-slider.webp',
    imageClassName: styles.slideIt,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsEpoch1.slideIt.text"
      />
    ),
  },
];

export default stepsEpoch1;
