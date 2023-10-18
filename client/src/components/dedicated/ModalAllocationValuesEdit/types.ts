import { BigNumber } from 'ethers';

import ModalProps from 'components/core/Modal/types';

export default interface ModalAllocationValuesEditProps {
  isLimitVisible?: boolean;
  isManuallyEdited?: boolean;
  modalProps: Omit<ModalProps, 'children'>;
  onUpdateValue: (newValue: BigNumber) => void;
  restToDistribute?: BigNumber;
  valueCryptoSelected: BigNumber;
  valueCryptoTotal: BigNumber;
}
