import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsRecalculatingScore from 'components/Settings/SettingsRecalculatingScore';
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
      {...modalProps}
    >
      <SettingsRecalculatingScore onLastStepDone={modalProps.onClosePanel} />
    </Modal>
  );
};

export default ModalSettingsRecalculatingScore;
