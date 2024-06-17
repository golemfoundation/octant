import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Img from 'components/ui/Img';
import Modal from 'components/ui/Modal';
import ModalSettingsRecalculatingScoreProps from './types';
import SettingsAddressScore from '../SettingsAddressScore';

import styles from './ModalSettingsRecalculatingScore.module.scss';
import SettingsProgressPath from '../SettingsProgressPath';

const ModalSettingsRecalculatingScore: FC<ModalSettingsRecalculatingScoreProps> = ({
  modalProps,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalSettingsCalculatingYourUniqueness"
      header="Recalculating score"
      isOpen={modalProps.isOpen}
      onClosePanel={() => {
        modalProps.onClosePanel();
      }}
    >
      <SettingsAddressScore
        address="0xe5e11cc5fb894eF5A9D7Da768cFb17066b9d35D7"
        score={0}
        badgeLabel="primary"
      />
      <SettingsProgressPath />
    </Modal>
  );
};

export default ModalSettingsRecalculatingScore;
