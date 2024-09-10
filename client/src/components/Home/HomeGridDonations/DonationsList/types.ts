import { ResponseItem } from 'hooks/helpers/useUserAllocationsAllEpochs';

export default interface DonationsListProps {
  dataTest?: string;
  donations: ResponseItem['elements'];
  isLoading: boolean;
  numberOfSkeletons: number;
}
