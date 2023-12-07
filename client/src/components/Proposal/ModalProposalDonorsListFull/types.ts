import ModalProps from 'components/ui/Modal/types';

export default interface ModalProposalDonorsListFullProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
  proposalAddress: string;
}
