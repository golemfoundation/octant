import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import React, { FC, Fragment } from 'react';
import cx from 'classnames';

import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import { chevronLeft } from 'svg/navigation';
import { donorGenericIcon, tick } from 'svg/misc';
import { navigationTabs as navigationTabsDefault } from 'constants/navigationTabs/navigationTabs';
import Button from 'components/core/Button/Button';
import Description from 'components/core/Description/Description';
import Img from 'components/core/Img/Img';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';
import Svg from 'components/core/Svg/Svg';
import env from 'env';
import isAboveProposalDonationThresholdPercent from 'utils/isAboveProposalDonationThresholdPercent';
import triggerToast from 'utils/triggerToast';
import truncateEthAddress from 'utils/truncateEthAddress';
import useCurrentEpoch from 'hooks/useCurrentEpoch';
import useIdsInAllocation from 'hooks/useIdsInAllocation';
import useMatchedProposalRewards from 'hooks/useMatchedProposalRewards';
import useProposals from 'hooks/useProposals';
import useUsersWithTheirAllocations from 'hooks/useUsersWithTheirAllocations';

import ProposalViewProps from './types';
import styles from './style.module.scss';

const getCustomNavigationTabs = () => {
  const navigationTabs = [...navigationTabsDefault];
  navigationTabs[0] = {
    ...navigationTabs[0],
    icon: chevronLeft,
    isActive: true,
  };
  return navigationTabs;
};

const ProposalView: FC<ProposalViewProps> = ({ allocations }) => {
  const { ipfsGateway } = env;
  const { proposalId } = useParams();
  const proposalIdNumber = parseInt(proposalId!, 10);
  const { proposals } = useProposals();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const { data: usersWithTheirAllocations } = useUsersWithTheirAllocations(proposalId!, {
    refetchOnMount: true,
  });
  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ id }) => id.toString() === proposalId,
  );
  const proposal = proposals.find(({ id }) => id.toNumber() === proposalIdNumber);

  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    allocations,
    proposalName: proposal && proposal.name,
  });
  const shouldMatchedProposalRewardsBeAvailable =
    !!currentEpoch && ((currentEpoch > 1 && matchedProposalRewards) || currentEpoch === 1);

  if (!proposal || !shouldMatchedProposalRewardsBeAvailable) {
    return (
      <MainLayoutContainer
        classNameBody={styles.bodyLayout}
        isHeaderVisible={false}
        isLoading
        navigationTabs={getCustomNavigationTabs()}
      />
    );
  }

  if (proposal.isLoadingError) {
    triggerToast({
      title: 'Loading of this proposal encountered a problem.',
    });
    return (
      <Routes>
        <Route element={<Navigate to={ROOT_ROUTES.proposals.absolute} />} path="*" />
      </Routes>
    );
  }

  const { description, landscapeImageCID, name, profileImageCID, website } = proposal;

  const buttonProps = allocations.includes(proposalIdNumber)
    ? {
        Icon: <Svg img={tick} size={1.5} />,
        label: 'Added to Allocate',
      }
    : {
        label: 'Add to Allocate',
      };

  return (
    <MainLayoutContainer
      classNameBody={styles.bodyLayout}
      isHeaderVisible={false}
      landscapeImage={
        landscapeImageCID && (
          <div className={styles.imageLandscapeWrapper}>
            <Img className={styles.imageLandscape} src={`${ipfsGateway}${landscapeImageCID}`} />
          </div>
        )
      }
      navigationTabs={getCustomNavigationTabs()}
    >
      <div className={styles.proposalHeader}>
        <Img className={styles.imageProfile} src={`${ipfsGateway}${profileImageCID}`} />
        <div className={styles.nameAndAllocationValues}>
          <span className={styles.name}>{name}</span>
          <div className={styles.allocationValues}>
            {proposalMatchedProposalRewards ? (
              <Fragment>
                <div>{proposalMatchedProposalRewards?.sum}</div>
                <div className={styles.separator} />
                <div
                  className={cx(
                    styles.percentage,
                    isAboveProposalDonationThresholdPercent(
                      proposalMatchedProposalRewards?.percentage,
                    ) && styles.isAboveThreshold,
                  )}
                >
                  {proposalMatchedProposalRewards?.percentage} %
                </div>
              </Fragment>
            ) : (
              <Fragment>Allocation values are not available</Fragment>
            )}
          </div>
        </div>
      </div>
      <div className={styles.buttonAllocateWrapper}>
        <Button
          className={styles.buttonAllocate}
          onClick={() => onAddRemoveFromAllocate(proposalIdNumber)}
          variant="secondary"
          {...buttonProps}
        />
      </div>
      <div className={styles.body}>
        <Description text={description} />
        <Button className={styles.buttonWebsite} href={website.url} variant="link">
          {website.label || website.url}
        </Button>
      </div>
      <div className={styles.donors}>
        <div className={styles.header}>
          <span>Donors</span>{' '}
          {usersWithTheirAllocations && (
            <div className={styles.count}>{usersWithTheirAllocations.length}</div>
          )}
        </div>
        {usersWithTheirAllocations &&
          usersWithTheirAllocations.map(({ address }, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className={styles.donor}>
              <Svg classNameSvg={styles.donorIcon} img={donorGenericIcon} size={2.4} />
              {truncateEthAddress(address)}
            </div>
          ))}
      </div>
    </MainLayoutContainer>
  );
};

export default ProposalView;
