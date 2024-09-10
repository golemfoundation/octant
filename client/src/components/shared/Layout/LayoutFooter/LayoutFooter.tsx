import cx from 'classnames';
import React, { FC, memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Svg from 'components/ui/Svg';
import {
  BLOG_POST,
  BRAND_ASSETS_FIGMA_LINK,
  DISCORD_LINK,
  FARCASTER_LINK,
  GOLEM_FOUNDATION_LINK,
  OCTANT_BUILD_LINK,
  OCTANT_DOCS,
  TERMS_OF_USE,
  TWITTER_LINK,
} from 'constants/urls';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { octantSemiTransparent } from 'svg/logo';

import styles from './LayoutFooter.module.scss';
import LayoutFooterProps from './types';

const LayoutFooter: FC<LayoutFooterProps> = ({ className }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'layout.footer' });
  const { isDesktop } = useMediaQuery();

  const links = isDesktop
    ? [
        { label: t('links.website'), link: OCTANT_BUILD_LINK },
        { label: t('links.docs'), link: OCTANT_DOCS },
        { label: t('links.blog'), link: BLOG_POST },
        { label: t('links.discord'), link: DISCORD_LINK },
        { label: t('links.farcaster'), link: FARCASTER_LINK },
        { label: t('links.twitterX'), link: TWITTER_LINK },
        { label: t('links.brandAssets'), link: BRAND_ASSETS_FIGMA_LINK },
        { label: t('links.termsOfUse'), link: TERMS_OF_USE },
      ]
    : [
        { label: t('links.website'), link: OCTANT_BUILD_LINK },
        { label: t('links.docs'), link: OCTANT_DOCS },
        { label: t('links.farcaster'), link: FARCASTER_LINK },
        { label: t('links.twitterX'), link: TWITTER_LINK },
        { label: t('links.discord'), link: DISCORD_LINK },
        { label: t('links.termsOfUse'), link: TERMS_OF_USE },
      ];

  return (
    <div className={cx(styles.root, className)}>
      <div className={styles.wrapper}>
        <Svg img={octantSemiTransparent} size={4.8} />
        <div className={styles.octantText}>
          <Trans
            components={[
              // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
              <a
                className={styles.golemFoundationLink}
                href={GOLEM_FOUNDATION_LINK}
                rel="noreferrer"
                target="_blank"
              />,
            ]}
            i18nKey="layout.footer.octantText"
          />
        </div>
      </div>
      <div className={styles.links}>
        {links.map(({ link, label }) => (
          <a key={link} className={styles.link} href={link} rel="noreferrer" target="_blank">
            {`→ ${label}`}
          </a>
        ))}
      </div>
    </div>
  );
};

export default memo(LayoutFooter);
