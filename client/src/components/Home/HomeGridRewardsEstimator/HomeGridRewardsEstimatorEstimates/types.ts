import { GetValuesToDisplayReturnType } from 'hooks/helpers/useGetValuesToDisplay';

export default interface HomeGridRewardsEstimatorEstimatesProps {
  estimatedRewards?: GetValuesToDisplayReturnType;
  isLoading?: boolean;
  matchFunding?: GetValuesToDisplayReturnType;
}
