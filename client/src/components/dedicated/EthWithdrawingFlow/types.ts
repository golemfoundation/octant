import ModalProps from 'components/core/Modal/types';

export default interface EthWithdrawingFlowProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
