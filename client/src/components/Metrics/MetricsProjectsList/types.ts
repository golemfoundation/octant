import { ResponseItem } from 'hooks/helpers/useUserAllocationsAllEpochs';

export default interface MetricsProjectsListProps {
  isLoading: boolean;
  numberOfSkeletons: number;
  projects: ResponseItem['elements'];
}
