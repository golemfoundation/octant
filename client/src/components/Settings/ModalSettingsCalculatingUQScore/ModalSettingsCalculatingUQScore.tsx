import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsCalculatingUQScore from 'components/Settings/SettingsCalculatingUQScore';
import Button from 'components/ui/Button';
import Modal from 'components/ui/Modal';
import useSettingsStore from 'store/settings/store';

import styles from './ModalSettingsCalculatingUQScore.module.scss';
import ModalSettingsCalculatingUQScoreProps from './types';

const ModalSettingsCalculatingUQScore: FC<ModalSettingsCalculatingUQScoreProps> = ({
  modalProps,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  const { calculatingUQScoreMode, setIsDelegationConnectModalOpen } = useSettingsStore(state => ({
    calculatingUQScoreMode: state.data.calculatingUQScoreMode,
    setIsDelegationConnectModalOpen: state.setIsDelegationConnectModalOpen,
  }));

  const [showCloseButton, setShowCloseButton] = useState(false);

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalSettingsCalculatingUQScore"
      header={
        calculatingUQScoreMode === 'sign' ? (
          <div className={styles.header}>
            {t('signMessages')}
            <Button
              className={styles.button}
              onClick={() => setIsDelegationConnectModalOpen(true)}
              variant="cta"
            >
              {t('switchAccount')}
            </Button>
          </div>
        ) : (
          t('calculatingScore')
        )
      }
      isOverflowOnClickDisabled
      showCloseButton={showCloseButton}
      {...modalProps}
    >
      <SettingsCalculatingUQScore setShowCloseButton={setShowCloseButton} />
    </Modal>
  );
};

export default ModalSettingsCalculatingUQScore;
