import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface EpochResultsProps {
  className?: string;
  epoch: number;
  highlightedBarAddress: null | string;
  isLoading?: boolean;
  projects: ProjectIpfsWithRewards[];
  setHighlightedBarAddress: (address: null | string) => void;
}
