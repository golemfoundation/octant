import React, { FC, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import InputCheckbox from 'components/ui/InputCheckbox';
import Modal from 'components/ui/Modal';
import { SABLIER_APP_LINK, V2_PRIVACY_POLICY_URL, V2_TERMS_OF_SERVICE_URL } from 'constants/urls';
import useUserSablierStreams from 'hooks/queries/useUserSablierStreams';

import styles from './ModalMigration.module.scss';
import { getSteps } from './steps';
import ModalMigrationProps from './types';

const ModalMigration: FC<ModalMigrationProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.migrationModal',
  });
  const [currentStep, setCurrentStep] = useState<0 | 1>(0);
  const [isConsentGiven, setIsConsentGiven] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!modalProps.isOpen) {
      setCurrentStep(0);
      setIsConsentGiven(false);
      setError('');
    }
  }, [modalProps.isOpen]);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const onSetIsConsentGiven = (newValue: boolean): void => {
    setIsConsentGiven(newValue);
    if (newValue) {
      setError('');
    }
  };

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
      {step.textConsent && (
        <div className={styles.consent}>
          <Trans
            components={[
              <Button className={styles.docsLink} href={V2_TERMS_OF_SERVICE_URL} variant="link3" />,
              <Button className={styles.docsLink} href={V2_PRIVACY_POLICY_URL} variant="link3" />,
            ]}
            i18nKey={step.textConsent}
          />
        </div>
      )}
      {currentStep === 1 && (
        <div className={styles.checkboxWrapper}>
          <InputCheckbox
            inputId="modal-migration-consent"
            isChecked={isConsentGiven}
            // eslint-disable-next-line @typescript-eslint/naming-convention
            onChange={() => onSetIsConsentGiven(!isConsentGiven)}
          />
          <label className={styles.checkboxLabel} htmlFor="modal-migration-consent">
            {step.acknowledgment}

            {error && <div className={styles.error}>{error}</div>}
          </label>
        </div>
      )}
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
              : () => {
                  if (isConsentGiven) {
                    window.open('https://golem.foundation/', '_blank');
                    return;
                  }
                  if (step.error) {
                    setError(step.error);
                  }
                }
          }
          variant="cta"
        />
      </div>
    </Modal>
  );
};

export default ModalMigration;
