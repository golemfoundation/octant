import React, { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import { DISCORD_LINK, OCTANT_BUILD_LINK, OCTANT_DOCS } from 'constants/urls';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { arrowTopRight } from 'svg/misc';

import styles from './SettingsLinkBoxes.module.scss';

const SettingsLinkBoxes = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { isDesktop } = useMediaQuery();

  const mobileLinks = [
    {
      href: OCTANT_BUILD_LINK,
      label: isDesktop ? t('visitWebsite') : t('website'), // 'Website',
    },
    {
      href: OCTANT_DOCS,
      label: isDesktop ? t('checkOutDocs') : t('docs'), // 'Docs',
    },
    {
      href: DISCORD_LINK,
      label: isDesktop ? t('joinOurDiscord') : t('discord'),
    },
  ];

  return (
    <div className={styles.root}>
      {mobileLinks.map(({ href, label }) => (
        <BoxRounded
          key={href}
          childrenWrapperClassName={styles.boxChildrenWrapper}
          className={styles.box}
          hasPadding={false}
        >
          <Button
            key={href}
            className={styles.buttonLink}
            dataTest="SettingsLinkBoxes__Button"
            href={href}
            variant="link3"
          >
            <span className={styles.buttonLinkText}>{label}</span>
            <Svg classNameSvg={styles.buttonLinkArrowSvg} img={arrowTopRight} size={1} />
          </Button>
        </BoxRounded>
      ))}
    </div>
  );
};

export default memo(SettingsLinkBoxes);
