import React from 'react';
import { Trans } from 'react-i18next';

import Button from 'components/core/Button/Button';
import { DISCORD_LINK, OCTANT_BUILD_LINK, TWITTER_LINK } from 'constants/urls';
import i18n from 'i18n';

import styles from './ModalOnboarding.module.scss';
import { Step } from './types';

const stepsEpoch1: Step[] = [
  {
    header: i18n.t('views.onboarding.stepsEpoch1.welcomeToOctant.header'),
    image: 'images/onboarding/1_epoch1.webp',
    imageClassName: styles.welcomeToOctant,
    text: (
      <Trans
        components={[<Button href={OCTANT_BUILD_LINK} variant="link3" />]}
        i18nKey="views.onboarding.stepsEpoch1.welcomeToOctant.text"
      />
    ),
  },
  {
    header: i18n.t('views.onboarding.stepsEpoch1.earnRewards.header'),
    image: 'images/lock-glm.webp',
    imageClassName: styles.earnRewards,
    text: <Trans i18nKey="views.onboarding.stepsEpoch1.earnRewards.text" />,
  },
  {
    header: i18n.t('views.onboarding.stepsEpoch1.previewProjects.header'),
    image: 'images/favourites.webp',
    imageClassName: styles.previewProjects,
    text: <Trans i18nKey="views.onboarding.stepsEpoch1.previewProjects.text" />,
  },
  {
    header: i18n.t('views.onboarding.stepsEpoch1.getReady.header'),
    image: 'images/rewards.webp',
    imageClassName: styles.getReady,
    text: (
      <Trans
        components={[
          <Button href={OCTANT_BUILD_LINK} variant="link3" />,
          <Button href={DISCORD_LINK} variant="link3" />,
          <Button href={TWITTER_LINK} variant="link3" />,
        ]}
        i18nKey="views.onboarding.stepsEpoch1.getReady.text"
      />
    ),
  },
];

export default stepsEpoch1;
