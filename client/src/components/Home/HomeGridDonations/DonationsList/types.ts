import { ResponseItem } from 'hooks/helpers/useUserAllocationsAllEpochs';

export default interface DonationsListProps {
  dataTest?: string;
  isLoading: boolean;
  numberOfSkeletons: number;
  donations: ResponseItem['elements'];
}
