import ModalProps from 'components/ui/Modal/types';

export default interface ModalSettingsRecalculatingScoreProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
