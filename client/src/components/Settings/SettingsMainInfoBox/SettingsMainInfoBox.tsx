import cx from 'classnames';
import React, { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import { TERMS_OF_USE } from 'constants/urls';
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
        <div className={cx(styles.info, styles.poweredBy)}>{t('poweredByCoinGeckoApi')}</div>
        <Button
          className={styles.buttonLink}
          dataTest="SettingsMainInfoBox__Button"
          href={TERMS_OF_USE}
          variant="link3"
        >
          {t('termsAndConditions')}
        </Button>
      </div>
    </BoxRounded>
  );
};

export default memo(SettingsMainInfoBox);
