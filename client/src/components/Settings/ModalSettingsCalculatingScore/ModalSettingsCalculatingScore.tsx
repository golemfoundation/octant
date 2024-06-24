import { AnimatePresence } from 'framer-motion';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsAddressScore from 'components/Settings/SettingsAddressScore';
import SettingsProgressPath from 'components/Settings/SettingsProgressPath';
import Modal from 'components/ui/Modal';

import styles from './ModalSettingsCalculatingScore.module.scss';
import ModalSettingsRecalculatingScoreProps from './types';

const ModalSettingsCalculatingScore: FC<ModalSettingsRecalculatingScoreProps> = ({
  modalProps,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsFinished(true), 4000);
  }, []);

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalSettingsCalculatingScore"
      header={isFinished ? t('switchAccounts') : t('calculatingScore')}
      showCloseButton={isFinished}
      {...modalProps}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <SettingsAddressScore
          key="address-score-1"
          address="0xe5e11cc5fb894eF5A9D7Da768cFb17066b9d35D7"
          badge="primary"
          className={styles.primaryAddress}
          isSelected
          mode={isFinished ? 'select' : 'score'}
          score={22}
        />
        <SettingsAddressScore
          key="address-score-2"
          address="0xe5e11cc5fb894eF5A9D7Da768cFb17066b9d35D7"
          areBottomCornersRounded={isFinished}
          badge="secondary"
          mode={isFinished ? 'select' : 'score'}
          score={0}
        />
        {!isFinished && <SettingsProgressPath key="progress-path" lastDoneStep={null} />}
      </AnimatePresence>
    </Modal>
  );
};

export default ModalSettingsCalculatingScore;
