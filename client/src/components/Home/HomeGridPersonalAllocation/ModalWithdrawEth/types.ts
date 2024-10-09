import ModalProps from 'components/ui/Modal/types';

export default interface ModalWithdrawEthProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
