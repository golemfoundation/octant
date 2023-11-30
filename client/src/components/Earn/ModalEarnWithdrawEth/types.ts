import ModalProps from 'components/ui/Modal/types';

export default interface ModaEarnlWithdrawEthProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
