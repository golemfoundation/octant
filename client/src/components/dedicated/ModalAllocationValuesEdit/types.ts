import { BigNumber } from 'ethers';

import ModalProps from 'components/core/Modal/types';

export default interface ModalAllocationValuesEditProps {
  isLimitVisible?: boolean;
  modalProps: Omit<ModalProps, 'children'>;
  onValueChange: (newValue: BigNumber) => void;
  restToDistribute?: BigNumber;
  valueCryptoSelected: BigNumber;
  valueCryptoTotal: BigNumber;
}
