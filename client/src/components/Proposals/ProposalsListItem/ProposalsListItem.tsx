import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

import ProposalItemSkeleton from 'components/Proposals/ProposalsListSkeletonItem/ProposalsListSkeletonItem';
import ButtonAddToAllocate from 'components/shared/ButtonAddToAllocate';
import Rewards from 'components/shared/Rewards';
import Description from 'components/ui/Description';
import Img from 'components/ui/Img';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';

import styles from './ProposalsListItem.module.scss';
import ProposalsListItemProps from './types';

const ProposalsListItem: FC<ProposalsListItemProps> = ({
  className,
  dataTest,
  epoch,
  proposalIpfsWithRewards,
}) => {
  const { ipfsGateway } = env;
  const { address, isLoadingError, profileImageSmall, name, introDescription } =
    proposalIpfsWithRewards;
  const navigate = useNavigate();
  const { data: userAllocations } = useUserAllocations(epoch);
  const { allocations, setAllocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
    setAllocations: state.setAllocations,
  }));
  const { data: currentEpoch } = useCurrentEpoch();
  const isAddedToAllocate = allocations!.includes(proposalIpfsWithRewards.address);

  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    allocations,
    setAllocations,
    userAllocationsElements: userAllocations?.elements,
  });

  const isAllocatedTo = !!userAllocations?.elements.find(
    ({ address: userAllocationAddress }) => userAllocationAddress === address,
  );
  const isEpoch1 = currentEpoch === 1;
  const isArchivedProposal = epoch !== undefined;

  return (
    <div
      className={cx(
        styles.root,
        className,
        !isLoadingError && styles.isClickable,
        isEpoch1 && styles.isEpoch1,
      )}
      data-address={address}
      data-epoch={epoch}
      data-test={dataTest}
      onClick={
        isLoadingError
          ? () => {}
          : () => navigate(`${ROOT_ROUTES.proposal.absolute}/${epoch || currentEpoch}/${address}`)
      }
    >
      {isLoadingError ? (
        <ProposalItemSkeleton />
      ) : (
        <Fragment>
          <div className={styles.header}>
            <Img
              className={styles.imageProfile}
              dataTest={
                epoch
                  ? 'ProposalsListItem__imageProfile--archive'
                  : 'ProposalsListItem__imageProfile'
              }
              src={`${ipfsGateway}${profileImageSmall}`}
            />
            <ButtonAddToAllocate
              className={styles.button}
              dataTest={
                epoch
                  ? 'ProposalsListItem__ButtonAddToAllocate--archive'
                  : 'ProposalsListItem__ButtonAddToAllocate'
              }
              isAddedToAllocate={isAddedToAllocate}
              isAllocatedTo={isAllocatedTo}
              isArchivedProposal={isArchivedProposal}
              onClick={() => onAddRemoveFromAllocate(address)}
            />
          </div>
          <div className={styles.body}>
            <div
              className={styles.name}
              data-test={epoch ? 'ProposalsListItem__name--archive' : 'ProposalsListItem__name'}
            >
              {name}
            </div>
            <Description
              className={styles.introDescription}
              dataTest={
                epoch
                  ? 'ProposalsListItem__IntroDescription--archive'
                  : 'ProposalsListItem__IntroDescription'
              }
              text={introDescription!}
            />
          </div>
          {!isEpoch1 && (
            <Rewards
              address={address}
              className={styles.proposalRewards}
              epoch={epoch}
              numberOfDonors={proposalIpfsWithRewards.numberOfDonors}
              totalValueOfAllocations={proposalIpfsWithRewards.totalValueOfAllocations}
            />
          )}
        </Fragment>
      )}
    </div>
  );
};

export default ProposalsListItem;
