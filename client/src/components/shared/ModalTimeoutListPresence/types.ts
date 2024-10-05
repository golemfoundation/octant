import ModalProps from 'components/ui/Modal/types';

export default interface ModalTimeoutListPresenceProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
