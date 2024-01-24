import { BigNumber } from 'ethers';

export type FormFields = {
  valueCryptoSelected: string;
};

export default interface AllocationInputsProps {
  className?: string;
  isManuallyEdited?: boolean;
  onClose: (newValue: BigNumber) => void;
  restToDistribute?: BigNumber;
  valueCryptoSelected: BigNumber;
  valueCryptoTotal: BigNumber;
}
