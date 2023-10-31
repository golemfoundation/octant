import { BigNumber } from 'ethers';
import React, { FC } from 'react';

import Modal from 'components/core/Modal/Modal';
import AllocationInputs from 'components/dedicated/AllocationInputs/AllocationInputs';

import styles from './ModalAllocationValuesEdit.module.scss';
import ModalAllocationValuesEditProps from './types';

const ModalAllocationValuesEdit: FC<ModalAllocationValuesEditProps> = ({
  modalProps,
  onUpdateValue,
  ...rest
}) => {
  const handleOnModalClosed = (newValue: BigNumber) => {
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
