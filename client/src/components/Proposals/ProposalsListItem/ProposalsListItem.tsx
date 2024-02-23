import cx from 'classnames';
import React, { FC, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import ProposalItemSkeleton from 'components/Proposals/ProposalsListSkeletonItem/ProposalsListSkeletonItem';
import ButtonAddToAllocate from 'components/shared/ButtonAddToAllocate';
import Rewards from 'components/shared/Rewards';
import Description from 'components/ui/Description';
import Img from 'components/ui/Img';
import { WINDOW_PROPOSALS_SCROLL_Y } from 'constants/window';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
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
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { allocations, addAllocations, removeAllocations } = useAllocationsStore(state => ({
    addAllocations: state.addAllocations,
    allocations: state.data.allocations,
    removeAllocations: state.removeAllocations,
  }));
  const { data: currentEpoch } = useCurrentEpoch();
  const isAddedToAllocate = allocations!.includes(proposalIpfsWithRewards.address);

  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    addAllocations,
    allocations,
    isDecisionWindowOpen,
    removeAllocations,
    userAllocationsElements: userAllocations?.elements,
  });

  const isAllocatedTo = useMemo(() => {
    const isInUserAllocations = !!userAllocations?.elements.find(
      ({ address: userAllocationAddress }) => userAllocationAddress === address,
    );
    const isInAllocations = allocations.includes(address);
    if (epoch !== undefined) {
      return isInUserAllocations;
    }
    if (isDecisionWindowOpen) {
      return isInUserAllocations && isInAllocations;
    }
    return false;
  }, [address, allocations, userAllocations, epoch, isDecisionWindowOpen]);
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
      data-test={dataTest}
      onClick={
        isLoadingError
          ? () => {}
          : () => {
              window[WINDOW_PROPOSALS_SCROLL_Y] = window.scrollY;
              navigate(
                `${ROOT_ROUTES.proposal.absolute}/${
                  epoch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch)
                }/${address}`,
              );
            }
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
            {((isAllocatedTo && isArchivedProposal) || !isArchivedProposal) && (
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
            )}
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
