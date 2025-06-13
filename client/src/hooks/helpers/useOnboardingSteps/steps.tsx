import React from 'react';
import { Trans } from 'react-i18next';

import styles from 'components/shared/ModalOnboarding/ModalOnboarding.module.scss';
import { Step } from 'components/shared/ModalOnboarding/types';
import Button from 'components/ui/Button';
import { DISCORD_LINK, FARCASTER_LINK, OCTANT_BUILD_LINK, X_LINK } from 'constants/urls';
import i18n from 'i18n';

export const getStepsDecisionWindowOpen = (
  epoch: string,
  epochNext: string,
  changeAWDate: string,
  timeCurrentEpochEndFormatted: string,
): Step[] => [
  {
    header: i18n.t('views.onboarding.stepsDecisionWindowOpen.welcomeToOctant.header', { epoch }),
    image: 'images/onboarding/1.webp',
    imageClassName: styles.welcomeToOctant,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsDecisionWindowOpen.welcomeToOctant.text"
        values={{ date: changeAWDate }}
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
        values={{ date: timeCurrentEpochEndFormatted, epoch: epochNext }}
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
        values={{ date: timeCurrentEpochEndFormatted }}
      />
    ),
  },
];

export const getStepsDecisionWindowClosed = (epoch: string, changeAWDate: string): Step[] => [
  {
    header: i18n.t('views.onboarding.stepsDecisionWindowClosed.welcomeToOctant.header', {
      epoch,
    }),
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
    image: 'images/cycle.webp',
    imageClassName: styles.earnRewards,
    text: (
      <Trans
        components={[<span className={styles.bold} />]}
        i18nKey="views.onboarding.stepsDecisionWindowClosed.earnRewards.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.stepsDecisionWindowClosed.getReady.header'),
    image: 'images/rewards.webp',
    imageClassName: styles.slideIt,
    text: (
      <Trans
        components={[
          <Button className={styles.link} href={OCTANT_BUILD_LINK} variant="link3" />,
          <Button className={styles.link} href={DISCORD_LINK} variant="link3" />,
          <Button className={styles.link} href={X_LINK} variant="link3" />,
          <Button className={styles.link} href={FARCASTER_LINK} variant="link3" />,
        ]}
        i18nKey="views.onboarding.stepsDecisionWindowClosed.getReady.text"
        values={{ date: changeAWDate }}
      />
    ),
  },
];
