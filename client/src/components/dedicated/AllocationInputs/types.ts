import { BigNumber } from 'ethers';

export type FormFields = {
  valueCryptoSelected: string;
};

export type InputFocused = 'crypto' | 'percent' | null;

export default interface AllocationInputsProps {
  className?: string;
  isLimitVisible?: boolean;
  isManuallyEdited?: boolean;
  onClose: (newValue: BigNumber) => void;
  restToDistribute?: BigNumber;
  valueCryptoSelected: BigNumber;
  valueCryptoTotal: BigNumber;
}
