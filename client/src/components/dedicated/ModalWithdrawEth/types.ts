import ModalProps from 'components/core/Modal/types';

export default interface ModalWithdrawEthProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
