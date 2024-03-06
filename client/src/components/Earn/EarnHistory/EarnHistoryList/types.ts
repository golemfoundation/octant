import EarnHistoryItemProps from 'components/Earn/EarnHistory/EarnHistoryItem/types';

export default interface EarnHistoryListProps {
  history: Omit<EarnHistoryItemProps, 'isLast'>[] | undefined;
}
