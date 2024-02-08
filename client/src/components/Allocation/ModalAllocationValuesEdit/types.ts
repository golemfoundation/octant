import { BigNumber } from 'ethers';

import ModalProps from 'components/ui/Modal/types';

export default interface ModalAllocationValuesEditProps {
  isManuallyEdited?: boolean;
  modalProps: Omit<ModalProps, 'children'>;
  onUpdateValue: (newValue: BigNumber) => void;
  restToDistribute?: BigNumber;
  valueCryptoSelected: BigNumber;
  valueCryptoTotal: BigNumber;
}
