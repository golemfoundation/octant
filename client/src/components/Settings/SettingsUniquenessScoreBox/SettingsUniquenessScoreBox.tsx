import React, { ReactNode, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsUniquenessScoreAddresses from 'components/Settings/SettingsUniquenessScoreAddresses';
import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';

import styles from './SettingsUniquenessScoreBox.module.scss';

import ModalSettingsCalculatingYourUniqueness from '../ModalSettingsCalculatingYourUniqueness';
import ModalSettingsRecalculatingScore from '../ModalSettingsRecalculatingScore';

const SettingsUniquenessScoreBox = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalRecalculatingScoreOpen, setIsModalRecalculatingScoreOpen] = useState(false);

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
      titleSuffix={
        <div className={styles.titleSuffix} onClick={() => setIsModalOpen(true)}>
          {t('whatIsThis')}
        </div>
      }
    >
      <>
        <SettingsUniquenessScoreAddresses />
        <div className={styles.buttonsWrapper}>
          <Button
            className={styles.button}
            isHigh
            onClick={() => setIsModalRecalculatingScoreOpen(true)}
            variant="cta"
          >
            {t('recalculate')}
          </Button>
          <Button className={styles.button} isHigh>
            {t('delegate')}
          </Button>
        </div>
        <ModalSettingsCalculatingYourUniqueness
          modalProps={{ isOpen: isModalOpen, onClosePanel: () => setIsModalOpen(false) }}
        />
        <ModalSettingsRecalculatingScore
          modalProps={{
            isOpen: isModalRecalculatingScoreOpen,
            onClosePanel: () => setIsModalRecalculatingScoreOpen(false),
          }}
        />
      </>
    </BoxRounded>
  );
};

export default memo(SettingsUniquenessScoreBox);
