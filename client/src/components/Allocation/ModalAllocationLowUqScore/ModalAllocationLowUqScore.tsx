import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import AllocationLowUqScore from 'components/Allocation/AllocationLowUqScore';
import Img from 'components/ui/Img';
import Modal from 'components/ui/Modal';

import styles from './ModalAllocationLowUqScore.module.scss';
import ModalAllocationLowUqScoreProps from './types';

const ModalAllocationLowUqScore: FC<ModalAllocationLowUqScoreProps> = ({
  modalProps,
  onAllocate,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.allocation.lowUQScoreModal',
  });

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalSettingsCalculatingUQScore"
      header={t('header')}
      Image={<Img className={styles.image} src="/images/calculator.webp" />}
      isOverflowOnClickDisabled
      {...modalProps}
    >
      <AllocationLowUqScore onAllocate={onAllocate} onCloseModal={modalProps.onClosePanel} />
    </Modal>
  );
};

export default ModalAllocationLowUqScore;
