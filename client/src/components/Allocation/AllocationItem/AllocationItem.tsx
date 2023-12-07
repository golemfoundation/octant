import cx from 'classnames';
import { formatUnits } from 'ethers/lib/utils';
import React, { FC, Fragment, memo } from 'react';

import AllocationItemRewards from 'components/Allocation/AllocationItemRewards';
import AllocationItemSkeleton from 'components/Allocation/AllocationItemSkeleton';
import BoxRounded from 'components/ui/BoxRounded';
import Img from 'components/ui/Img';
import InputText from 'components/ui/InputText';
import env from 'env';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';

import styles from './AllocationItem.module.scss';
import AllocationItemProps from './types';

const AllocationItem: FC<AllocationItemProps> = ({
  address,
  className,
  isLoadingError,
  name,
  onChange,
  profileImageSmall,
  value,
}) => {
  const { ipfsGateway } = env;
  const { data: currentEpoch } = useCurrentEpoch();
  const { isFetching: isFetchingRewardsThreshold } = useProposalRewardsThreshold();

  const isLoading = currentEpoch === undefined || isFetchingRewardsThreshold;
  const valueToRender = formatUnits(value, 'ether');
  const isEpoch1 = currentEpoch === 1;

  return (
    <BoxRounded
      childrenWrapperClassName={styles.boxRoundedChildren}
      className={cx(styles.root, className)}
    >
      {(isLoading || isLoadingError) && <AllocationItemSkeleton />}
      {!isLoading && !isLoadingError && (
        <Fragment>
          <div className={styles.projectData}>
            <Img
              className={styles.image}
              dataTest="ProposalItem__imageProfile"
              src={`${ipfsGateway}${profileImageSmall}`}
            />
            <div className={styles.nameAndRewards}>
              <div className={styles.name}>{name}</div>
              <AllocationItemRewards address={address} />
            </div>
          </div>
          <InputText
            className={cx(styles.input, isEpoch1 && styles.isEpoch1)}
            onChange={event => onChange(address, event.target.value)}
            placeholder="0.000"
            suffix="ETH"
            textAlign="right"
            value={value.isZero() ? undefined : valueToRender}
            variant="allocation"
          />
        </Fragment>
      )}
    </BoxRounded>
  );
};

export default memo(AllocationItem);
