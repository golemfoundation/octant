import { ResponseItem } from 'hooks/helpers/useUserAllocationsAllEpochs';

export default interface MetricsProjectsListProps {
  dataTest?: string;
  isLoading: boolean;
  numberOfSkeletons: number;
  projects: ResponseItem['elements'];
}
