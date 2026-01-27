import { useAccount } from 'wagmi';

import useDepositValue from 'hooks/queries/useDepositValue';
import useV2Deposits from 'hooks/subgraphRegenStaker/useV2Deposits';

function useIsUserMigrationDone(): { data: boolean; isFetching: boolean } {
  const { address } = useAccount();
  const { data: depositsValue, isFetching: isFetchingDepositValue } = useDepositValue();
  const { data: v2Deposits, isFetching: isFetchingV2Deposits } = useV2Deposits(address!);

  const doesUserHaveV1Lock = depositsValue !== undefined && depositsValue !== 0n;
  const doesUserHaveV2Deposits = v2Deposits !== undefined && v2Deposits.length > 0;

  return {
    data: !doesUserHaveV1Lock && doesUserHaveV2Deposits,
    isFetching: isFetchingDepositValue || isFetchingV2Deposits,
  };
}

export default useIsUserMigrationDone;
