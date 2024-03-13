import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export default interface ProjectListProps {
  epoch?: number;
  proposals: ProjectIpfsWithRewards[];
}
