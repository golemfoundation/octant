import cx from 'classnames';
import React, { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import Svg from 'components/ui/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import { octantWordmark } from 'svg/logo';

import styles from './SettingsMainInfoBox.module.scss';

const SettingsMainInfoBox = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { isDesktop } = useMediaQuery();
  const { data: currentEpoch } = useCurrentEpoch();

  return (
    <BoxRounded
      alignment="left"
      className={styles.root}
      hasPadding={false}
      isVertical
      textAlign="left"
    >
      <Svg
        classNameSvg={styles.infoTitle}
        img={octantWordmark}
        size={isDesktop ? [11.2, 2.7] : [8.4, 2]}
      />
      <div className={styles.infoEpoch}>{t('epoch', { epoch: currentEpoch })}</div>
      <div className={styles.infoContainer}>
        <div className={cx(styles.info, styles.golemFoundationProject)}>
          {t('golemFoundationProject')}
        </div>
        <div className={styles.info}>{t('poweredByCoinGeckoApi')}</div>
      </div>
    </BoxRounded>
  );
};

export default memo(SettingsMainInfoBox);
