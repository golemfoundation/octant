import React, { FC, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import Modal from 'components/ui/Modal';
import { SABLIER_APP_LINK } from 'constants/urls';
import useUserSablierStreams from 'hooks/queries/useUserSablierStreams';

import styles from './ModalMigration.module.scss';
import { getSteps } from './steps';
import ModalMigrationProps from './types';

const ModalMigration: FC<ModalMigrationProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.migrationModal',
  });
  const [currentStep, setCurrentStep] = useState<0 | 1>(0);

  const { data: userSablierStreams } = useUserSablierStreams();

  const steps = getSteps(t);
  const step = steps[currentStep];

  const userSablierStreamsValue =
    !userSablierStreams?.sablierStreams.some(({ isCancelled }) => isCancelled) &&
    userSablierStreams?.sumAvailable;

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalMigration"
      header={step.title}
      Image={<Img src={step.imgPath} />}
      {...modalProps}
    >
      <Trans i18nKey={step.text} />
      {userSablierStreamsValue !== 0n && (
        <Button
          className={styles.buttonSablier}
          dataTest="HomeGridCurrentGlmLockMigration__ButtonSablier"
          href={SABLIER_APP_LINK}
          variant="link"
        >
          {t('sablierText')}
        </Button>
      )}
      <div className={styles.buttons}>
        {currentStep === 1 && (
          <Button
            className={styles.button}
            isHigh
            label={t('buttons.later')}
            onClick={modalProps.onClosePanel}
            variant="secondary"
          />
        )}
        <Button
          className={styles.button}
          isHigh
          label={currentStep === 0 ? t('buttons.ok') : t('buttons.startMigration')}
          onClick={
            currentStep === 0
              ? () => setCurrentStep(1)
              : () => window.open('https://golem.foundation/', '_blank')
          }
          variant="cta"
        />
      </div>
    </Modal>
  );
};

export default ModalMigration;
