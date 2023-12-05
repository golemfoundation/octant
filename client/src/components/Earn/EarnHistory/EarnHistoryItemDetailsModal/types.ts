import HistoryItemProps from 'components/Earn/EarnHistory/EarnHistoryItem/types';
import ModalProps from 'components/ui/Modal/types';

export default interface HistoryItemDetailsModalProps extends HistoryItemProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
