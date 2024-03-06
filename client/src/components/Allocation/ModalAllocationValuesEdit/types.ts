import ModalProps from 'components/ui/Modal/types';

export default interface ModalAllocationValuesEditProps {
  isManuallyEdited?: boolean;
  modalProps: Omit<ModalProps, 'children'>;
  onUpdateValue: (newValue: bigint) => void;
  restToDistribute?: bigint;
  valueCryptoSelected: bigint;
  valueCryptoTotal: bigint;
}
