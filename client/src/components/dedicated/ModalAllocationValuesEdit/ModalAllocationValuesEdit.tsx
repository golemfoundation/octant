import loadable from '@loadable/component';
import { BigNumber } from 'ethers';
import React, { FC, useState, useEffect } from 'react';

import Modal from 'components/core/Modal/Modal';

import styles from './ModalAllocationValuesEdit.module.scss';
import ModalAllocationValuesEditProps from './types';

const AllocationInputs = loadable(
  () => import('components/dedicated/AllocationInputs/AllocationInputs'),
);

const ModalAllocationValuesEdit: FC<ModalAllocationValuesEditProps> = ({
  modalProps,
  valueCryptoSelected,
  onValueChange,
  ...rest
}) => {
  const [localValueCryptoSelected, setLocalValueCryptoSelected] = useState<BigNumber>();

  const valueCryptoSelectedHexString = valueCryptoSelected?.toHexString();
  useEffect(() => {
    setLocalValueCryptoSelected(valueCryptoSelected);
    // .toHexString(), because React can't compare objects as deps in hooks, causing infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueCryptoSelectedHexString]);

  const handleOnModalClosed = () => {
    modalProps.onClosePanel();

    if (localValueCryptoSelected) {
      onValueChange(localValueCryptoSelected);
    }
  };

  return (
    <Modal {...modalProps} bodyClassName={styles.root} variant="small">
      <div className={styles.body}>
        <AllocationInputs
          className={styles.inputs}
          onClose={modalProps.onClosePanel}
          onCloseAndSave={handleOnModalClosed}
          onValueChange={setLocalValueCryptoSelected}
          valueCryptoSelected={localValueCryptoSelected}
          {...rest}
        />
      </div>
    </Modal>
  );
};

export default ModalAllocationValuesEdit;
