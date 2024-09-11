import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CalculatingUQScore from 'components/Home/HomeGridUQScore/ModalCalculatingUQScore/CalculatingUQScore';
import Button from 'components/ui/Button';
import Modal from 'components/ui/Modal';
import useDelegationStore from 'store/delegation/store';

import styles from './ModalCalculatingUQScore.module.scss';
import ModalCalculatingUQScoreProps from './types';

const ModalCalculatingUQScore: FC<ModalCalculatingUQScoreProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridUQScore.modalCalculatingUQScore',
  });

  const { calculatingUQScoreMode, setIsDelegationConnectModalOpen } = useDelegationStore(state => ({
    calculatingUQScoreMode: state.data.calculatingUQScoreMode,
    setIsDelegationConnectModalOpen: state.setIsDelegationConnectModalOpen,
  }));

  const [showCloseButton, setShowCloseButton] = useState(false);

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalCalculatingUQScore"
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
      <CalculatingUQScore setShowCloseButton={setShowCloseButton} />
    </Modal>
  );
};

export default ModalCalculatingUQScore;
