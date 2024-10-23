import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import RecalculatingScore from 'components/Home/HomeGridUQScore/ModalRecalculatingScore/RecalculatingScore';
import Modal from 'components/ui/Modal';

import styles from './ModalRecalculatingScore.module.scss';
import ModalRecalculatingScoreProps from './types';

const ModalRecalculatingScore: FC<ModalRecalculatingScoreProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridUQScore.modalRecalculatingScore',
  });

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalRecalculatingScore"
      header={t('recalculatingScore')}
      {...modalProps}
    >
      <RecalculatingScore onLastStepDone={modalProps.onClosePanel} />
    </Modal>
  );
};

export default memo(ModalRecalculatingScore);
