import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import useDepositValue from 'hooks/queries/useDepositValue';
import useRegenStakerMinimumStakeAmount from 'hooks/queries/useRegenStakerMinimumStakeAmount';
import useV2Deposits from 'hooks/subgraphRegenStaker/useV2Deposits';

type UserMigrationStatus =
  | 'migration_done'
  | 'migration_required'
  | 'migration_not_required'
  | 'lock_too_small_for_v2';

function useUserMigrationStatus(): {
  data: {
    shouldButtonOpenModal: boolean;
    translationSuffix: string;
    userMigrationStatus: UserMigrationStatus;
  };
  isFetching: boolean;
} {
  const { address } = useAccount();
  const { data: depositsValue, isFetching: isFetchingDepositValue } = useDepositValue();
  const {
    data: regenStakerMinimumStakeAmount,
    isFetching: isFetchingRegenStakerMinimumStakeAmount,
  } = useRegenStakerMinimumStakeAmount();
  const { data: v2Deposits, isFetching: isFetchingV2Deposits } = useV2Deposits(address!);

  const doesUserHaveV1Lock = depositsValue !== undefined && depositsValue !== 0n;
  const doesUserHaveV2Deposits = v2Deposits !== undefined && v2Deposits.length > 0;

  const status = useMemo(() => {
    if (!depositsValue || !regenStakerMinimumStakeAmount) {
      // Does not matter, isFetching won't show status in UI anyway.
      return 'migration_required';
    }
    if (!doesUserHaveV1Lock && doesUserHaveV2Deposits) {
      return 'migration_done';
    }
    if (doesUserHaveV1Lock && depositsValue >= regenStakerMinimumStakeAmount) {
      return 'migration_required';
    }
    if (doesUserHaveV1Lock && depositsValue < regenStakerMinimumStakeAmount) {
      return 'lock_too_small_for_v2';
    }
    return 'migration_not_required';
  }, [doesUserHaveV1Lock, doesUserHaveV2Deposits, depositsValue, regenStakerMinimumStakeAmount]);

  const translationSuffix = useMemo(() => {
    if (status === 'migration_required') {
      return 'migrationRequired';
    }
    if (status === 'migration_done') {
      return 'migrationDone';
    }
    if (status === 'migration_not_required') {
      return 'migrationNotRequired';
    }
    return 'migrationLockTooSmallForV2';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return {
    data: {
      shouldButtonOpenModal: ['migration_required', 'lock_too_small_for_v2'].includes(status),
      translationSuffix,
      userMigrationStatus: status,
    },
    isFetching:
      isFetchingDepositValue || isFetchingV2Deposits || isFetchingRegenStakerMinimumStakeAmount,
  };
}

export default useUserMigrationStatus;
