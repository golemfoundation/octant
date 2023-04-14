import ModalProps from 'components/core/Modal/types';

export default interface ModalEffectiveLockedBalanceProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
