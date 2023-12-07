import { BigNumber } from 'ethers';

import AllocationInputsProps, { InputFocused } from 'components/Allocation/AllocationInputs/types';

export default interface AllocationInputsRewardsAvailableProps {
  className?: string;
  inputFocused: InputFocused;
  isThereSomethingToDistribute: boolean;
  isValueExceeded: boolean;
  restToDistribute: BigNumber;
  valueCryptoTotal: AllocationInputsProps['valueCryptoTotal'];
}
