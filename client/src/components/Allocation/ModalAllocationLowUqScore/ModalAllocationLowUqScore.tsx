import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Img from 'components/ui/Img';
import Modal from 'components/ui/Modal';

import styles from './ModalAllocationLowUqScore.module.scss';
import ModalAllocationLowUqScoreProps from './types';

import AllocationLowUqScore from '../AllocationLowUqScore';

const ModalAllocationLowUqScore: FC<ModalAllocationLowUqScoreProps> = ({
  modalProps,
  onAllocate,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.allocation.lowUQScoreModal' });

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalSettingsCalculatingUQScore"
      header={t('header')}
      Image={<Img className={styles.image} src="/images/calculator.webp" />}
      isOverflowOnClickDisabled
      {...modalProps}
    >
      <AllocationLowUqScore onAllocate={onAllocate} />
    </Modal>
  );
};

export default ModalAllocationLowUqScore;
