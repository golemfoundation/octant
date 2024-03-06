import EarnHistoryItemProps from 'components/Earn/EarnHistory/EarnHistoryItem/types';

type EarnHistoryItemDetailsProps = Omit<EarnHistoryItemProps, 'isLast'>;

export default EarnHistoryItemDetailsProps;
