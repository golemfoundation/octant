import ModalProps from 'components/ui/Modal/types';

export default interface ModalProjectDonorsListFullProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
  proposalAddress: string;
}
