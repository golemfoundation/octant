import ModalProps from 'components/core/Modal/types';

export default interface ModalRewardsCalculatorProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
