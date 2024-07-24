import ModalProps from 'components/ui/Modal/types';

export default interface ModalAllocationLowUqScoreProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
  onAllocate: () => void;
}
