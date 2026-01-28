import { useAccount } from 'wagmi';

import useDepositValue from 'hooks/queries/useDepositValue';
import useV2Deposits from 'hooks/subgraphRegenStaker/useV2Deposits';

function useIsUserMigrationDoneOrRequired(): {
  data: { isUserMigrationDone: boolean; isUserMigrationRequired: boolean };
  isFetching: boolean;
} {
  const { address } = useAccount();
  const { data: depositsValue, isFetching: isFetchingDepositValue } = useDepositValue();
  const { data: v2Deposits, isFetching: isFetchingV2Deposits } = useV2Deposits(address!);

  const doesUserHaveV1Lock = depositsValue !== undefined && depositsValue !== 0n;
  const doesUserHaveV2Deposits = v2Deposits !== undefined && v2Deposits.length > 0;

  return {
    data: {
      isUserMigrationDone: !doesUserHaveV1Lock && doesUserHaveV2Deposits,
      isUserMigrationRequired: doesUserHaveV1Lock,
    },
    isFetching: isFetchingDepositValue || isFetchingV2Deposits,
  };
}

export default useIsUserMigrationDoneOrRequired;
