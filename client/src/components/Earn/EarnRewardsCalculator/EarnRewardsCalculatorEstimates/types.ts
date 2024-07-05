import { GetValuesToDisplayReturnType } from 'hooks/helpers/useGetValuesToDisplay';

export interface EarnRewardsCalculatorEstimatesProps {
  estimatedRewards: GetValuesToDisplayReturnType;
  isLoading?: boolean;
  matchFunding: GetValuesToDisplayReturnType;
}
