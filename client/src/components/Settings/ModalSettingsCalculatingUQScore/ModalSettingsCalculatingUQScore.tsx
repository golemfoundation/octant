import React, { FC } from 'react';
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

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalSettingsCalculatingUQScore"
      header={
        calculatingUQScoreMode === 'sign' ? (
          <div className={styles.header}>
            Sign messages
            <Button
              className={styles.button}
              onClick={() => setIsDelegationConnectModalOpen(true)}
              variant="cta"
            >
              Switch account
            </Button>
          </div>
        ) : (
          t('calculatingScore')
        )
      }
      isOverflowOnClickDisabled
      showCloseButton={false}
      {...modalProps}
    >
      <SettingsCalculatingUQScore />
    </Modal>
  );
};

export default ModalSettingsCalculatingUQScore;
