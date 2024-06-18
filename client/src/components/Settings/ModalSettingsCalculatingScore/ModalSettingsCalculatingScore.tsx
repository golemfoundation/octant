import React, { FC } from 'react';
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

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalSettingsCalculatingScore"
      header={t('calculatingScore')}
      isOpen={modalProps.isOpen}
      onClosePanel={modalProps.onClosePanel}
    >
      <SettingsAddressScore
        address="0xe5e11cc5fb894eF5A9D7Da768cFb17066b9d35D7"
        badge="primary"
        className={styles.primaryAddress}
        score={22}
      />
      <SettingsAddressScore
        address="0xe5e11cc5fb894eF5A9D7Da768cFb17066b9d35D7"
        areBottomCornersRounded={false}
        badge="secondary"
        score={0}
      />
      <SettingsProgressPath />
    </Modal>
  );
};

export default ModalSettingsCalculatingScore;
