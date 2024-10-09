import ModalProps from 'components/ui/Modal/types';

export default interface ModalRecalculatingScoreProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
