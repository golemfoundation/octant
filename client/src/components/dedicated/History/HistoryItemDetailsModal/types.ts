import ModalProps from 'components/core/Modal/types';
import HistoryItemProps from 'components/dedicated/History/HistoryItem/types';

export default interface HistoryItemDetailsModalProps extends HistoryItemProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}
