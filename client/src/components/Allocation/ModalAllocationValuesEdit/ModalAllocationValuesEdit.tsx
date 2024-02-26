import React, { FC } from 'react';

import AllocationInputs from 'components/Allocation/AllocationInputs';
import Modal from 'components/ui/Modal';

import styles from './ModalAllocationValuesEdit.module.scss';
import ModalAllocationValuesEditProps from './types';

const ModalAllocationValuesEdit: FC<ModalAllocationValuesEditProps> = ({
  modalProps,
  onUpdateValue,
  ...rest
}) => {
  const handleOnModalClosed = (newValue: bigint) => {
    modalProps.onClosePanel();
    onUpdateValue(newValue);
  };

  return (
    <Modal {...modalProps} bodyClassName={styles.root}>
      <div className={styles.body}>
        <AllocationInputs className={styles.inputs} onClose={handleOnModalClosed} {...rest} />
      </div>
    </Modal>
  );
};

export default ModalAllocationValuesEdit;
