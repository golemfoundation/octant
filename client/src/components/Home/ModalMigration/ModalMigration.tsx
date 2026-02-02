import React, { FC, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import InputCheckbox from 'components/ui/InputCheckbox';
import Modal from 'components/ui/Modal';
import { SABLIER_APP_LINK, V2_PRIVACY_POLICY_URL, V2_TERMS_OF_SERVICE_URL } from 'constants/urls';
import env from 'env';
import useUserMigrationStatus, { UserMigrationStatus } from 'hooks/helpers/useUserMigrationStatus';
import useMigrateDepositToV2 from 'hooks/mutations/useMigrateDepositToV2';
import useUserSablierStreams from 'hooks/queries/useUserSablierStreams';

import styles from './ModalMigration.module.scss';
import { getSteps } from './steps';
import ModalMigrationProps from './types';

const ModalMigration: FC<ModalMigrationProps> = ({
  modalProps: { onClosePanel, ...modalPropsRest },
}) => {
  const { regenStakerUrl } = env;
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.migrationModal',
  });
  const [currentStep, setCurrentStep] = useState<0 | 1>(0);
  const [isConsentGiven, setIsConsentGiven] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const {
    data: { userMigrationStatus },
    refetch: refetchUserMigrationStatus,
  } = useUserMigrationStatus();

  const [initialUserMigrationStatus] = useState<UserMigrationStatus | undefined>(
    userMigrationStatus,
  );

  const shouldV2DepositBeTriggered = initialUserMigrationStatus === 'migration_required';

  const {
    mutateAsync: migrateDepositToV2MutateAsync,
    isPending: isPendingMigrateDepositToV2,
    reset: resetMigrateDeposit,
  } = useMigrateDepositToV2({
    actionAfterUnlock: shouldV2DepositBeTriggered ? 'deposit_in_v2' : 'redirect_to_v2',
    options: {
      onError: () => {
        setError(t('migrationNotifications.error'));
      },
      onSuccess: () => {
        setSuccessMessage(t('migrationNotifications.success'));
      },
    },
  });

  useEffect(() => {
    if (!modalPropsRest.isOpen) {
      setCurrentStep(0);
      setIsConsentGiven(false);
      setError('');
      setSuccessMessage('');
    }
  }, [modalPropsRest.isOpen]);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const onSetIsConsentGiven = (newValue: boolean): void => {
    setIsConsentGiven(newValue);
    if (newValue) {
      setError('');
    }
  };

  const { data: userSablierStreams } = useUserSablierStreams();

  const steps = getSteps(
    t,
    shouldV2DepositBeTriggered ? 'migrationRequired' : 'migrationLockTooSmallForV2',
  );
  const step = steps[currentStep];

  const userSablierStreamsValue =
    !userSablierStreams?.sablierStreams.some(({ isCancelled }) => isCancelled) &&
    userSablierStreams?.sumAvailable;

  const _onClosePanel = () => {
    onClosePanel();
    refetchUserMigrationStatus();
  };

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalMigration"
      header={step.title}
      Image={<Img src={step.imgPath} />}
      onClosePanel={_onClosePanel}
      {...modalPropsRest}
    >
      <Trans i18nKey={step.text} />
      {!successMessage && shouldV2DepositBeTriggered && (
        <>
          {step.textConsent && (
            <div className={styles.consent}>
              <Trans
                components={[
                  <Button
                    className={styles.docsLink}
                    href={V2_TERMS_OF_SERVICE_URL}
                    variant="link3"
                  />,
                  <Button
                    className={styles.docsLink}
                    href={V2_PRIVACY_POLICY_URL}
                    variant="link3"
                  />,
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
        </>
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
      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
      <div className={styles.buttons}>
        {successMessage && (
          <Button
            className={styles.button}
            isHigh
            label={t('buttons.migrationDone')}
            onClick={() => window.open(regenStakerUrl, '_blank')}
            variant="cta"
          />
        )}
        {!successMessage && (
          <>
            {currentStep === 1 && (
              <Button
                className={styles.button}
                isHigh
                label={t('buttons.later')}
                onClick={onClosePanel}
                variant="secondary"
              />
            )}
            <Button
              className={styles.button}
              isHigh
              isLoading={isPendingMigrateDepositToV2}
              label={currentStep === 0 ? t('buttons.ok') : t('buttons.startMigration')}
              onClick={
                currentStep === 0
                  ? () => setCurrentStep(1)
                  : () => {
                      if (
                        (initialUserMigrationStatus === 'migration_required' && isConsentGiven) ||
                        initialUserMigrationStatus === 'lock_too_small_for_v2'
                      ) {
                        setError('');
                        resetMigrateDeposit();
                        migrateDepositToV2MutateAsync().catch(() => undefined);
                        return;
                      }
                      if (step.error) {
                        setError(step.error);
                      }
                    }
              }
              variant="cta"
            />
          </>
        )}
      </div>
    </Modal>
  );
};

export default ModalMigration;
