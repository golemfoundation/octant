import { BigNumberish } from 'ethers';

import { CurrentStepIndex } from 'components/dedicated/GlmStakingFlow/types';

export default interface BudgetBoxProps {
  className: string;
  currentStepIndex: CurrentStepIndex;
  depositsValue?: BigNumberish;
  transactionHash: string;
}
