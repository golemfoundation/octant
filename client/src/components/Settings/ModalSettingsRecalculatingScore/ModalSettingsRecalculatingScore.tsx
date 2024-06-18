import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsAddressScore from 'components/Settings/SettingsAddressScore';
import SettingsProgressPath from 'components/Settings/SettingsProgressPath';
import Modal from 'components/ui/Modal';

import styles from './ModalSettingsRecalculatingScore.module.scss';
import ModalSettingsRecalculatingScoreProps from './types';

const ModalSettingsRecalculatingScore: FC<ModalSettingsRecalculatingScoreProps> = ({
  modalProps,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalSettingsRecalculatingScore"
      header={t('recalculatingScore')}
      isOpen={modalProps.isOpen}
      onClosePanel={() => {
        modalProps.onClosePanel();
      }}
    >
      <SettingsAddressScore
        address="0xe5e11cc5fb894eF5A9D7Da768cFb17066b9d35D7"
        areBottomCornersRounded={false}
        badgeLabel="primary"
        score={0}
      />
      <SettingsProgressPath />
    </Modal>
  );
};

export default ModalSettingsRecalculatingScore;
