import ModalProps from 'components/ui/Modal/types';

export default interface ModalEarnRewardsCalculatorProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
