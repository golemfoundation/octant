import React, { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import { DISCORD_LINK, OCTANT_BUILD_LINK, OCTANT_DOCS, TERMS_OF_USE } from 'constants/urls';
import { arrowRight } from 'svg/misc';

import styles from './SettingsLinksInfoBox.module.scss';

const SettingsLinksInfoBox = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  const desktopLinks = [
    {
      href: OCTANT_BUILD_LINK,
      label: t('octantBuild'), // 'Octant.build',
    },
    {
      href: OCTANT_DOCS,
      label: t('userDocs'), // 'User Docs',
    },
    {
      href: DISCORD_LINK,
      label: t('discordCommunity'), // 'Discord Community',
    },
    {
      href: TERMS_OF_USE,
      label: t('termsAndConditions'),
    },
  ];

  return (
    <BoxRounded
      alignment="left"
      className={styles.root}
      hasPadding={false}
      isVertical
      justifyContent="spaceBetween"
      textAlign="left"
    >
      <div className={styles.octantInfo}>{t('octantInfo')}</div>
      <div>
        {desktopLinks.map(({ label, href }) => (
          <Button key={href} className={styles.buttonLink} href={href} variant="link3">
            <Svg classNameSvg={styles.buttonLinkArrowSvg} img={arrowRight} size={1.2} />
            <span className={styles.buttonLinkText}>{label}</span>
          </Button>
        ))}
      </div>
    </BoxRounded>
  );
};

export default memo(SettingsLinksInfoBox);
