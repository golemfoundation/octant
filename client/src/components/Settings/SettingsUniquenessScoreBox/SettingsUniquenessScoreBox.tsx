import React, { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';

import styles from './SettingsUniquenessScoreBox.module.scss';

import SettingsUniquenessScoreAddresses from '../SettingsUniquenessScoreAddresses';

const SettingsUniquenessScoreBox = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  return (
    <BoxRounded
      alignment="left"
      className={styles.root}
      hasPadding={false}
      hasSections
      isVertical
      justifyContent="spaceBetween"
      textAlign="left"
      title={t('yourUniquenessScore')}
      titleSuffix={<div className={styles.titleSuffix}>{t('whatIsThis')}</div>}
    >
      <>
        <SettingsUniquenessScoreAddresses />
        <div className={styles.buttonsWrapper}>
          <Button className={styles.button} isHigh variant="cta">
            {t('recalculate')}
          </Button>
          <Button className={styles.button} isHigh>
            {t('delegate')}
          </Button>
        </div>
      </>
    </BoxRounded>
  );
};

export default memo(SettingsUniquenessScoreBox);
