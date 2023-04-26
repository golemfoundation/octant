import ModalProps from 'components/core/Modal/types';

export type FormValues = {
  valueToWithdraw: string;
};

export default interface ModalWithdrawEthProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
