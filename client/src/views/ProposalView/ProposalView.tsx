import cx from 'classnames';
import React, { ReactElement, Fragment, useEffect } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import Button from 'components/core/Button/Button';
import Description from 'components/core/Description/Description';
import Img from 'components/core/Img/Img';
import Svg from 'components/core/Svg/Svg';
import { navigationTabs as navigationTabsDefault } from 'constants/navigationTabs/navigationTabs';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposals from 'hooks/queries/useProposals';
import useProposalAllocations from 'hooks/subgraph/allocations/useProposalAllocations';
import MainLayout from 'layouts/MainLayout/MainLayout';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';
import { donorGenericIcon, tick } from 'svg/misc';
import { chevronLeft } from 'svg/navigation';
import getFormattedEthValue from 'utils/getFormattedEthValue';
import triggerToast from 'utils/triggerToast';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './ProposalView.module.scss';

const getCustomNavigationTabs = () => {
  const navigationTabs = [...navigationTabsDefault];
  navigationTabs[0] = {
    ...navigationTabs[0],
    icon: chevronLeft,
    isActive: true,
  };
  return navigationTabs;
};

const ProposalView = (): ReactElement => {
  const { ipfsGateway } = env;
  const { data: allocations } = useAllocationsStore();
  const { proposalAddress } = useParams();
  const { data: proposals } = useProposals();
  const { data: proposalAllocations, refetch: refetchProposalAllocations } = useProposalAllocations(
    { proposalAddress },
  );
  const isDonationAboveThreshold = useIsDonationAboveThreshold(proposalAddress!);
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address }) => address === proposalAddress,
  );
  const proposal = proposals.find(({ address }) => address === proposalAddress);

  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    allocations: allocations!,
    proposalName: proposal && proposal.name,
  });
  const shouldMatchedProposalRewardsBeAvailable =
    !!currentEpoch && ((currentEpoch > 1 && matchedProposalRewards) || currentEpoch === 1);

  useEffect(() => {
    refetchProposalAllocations();
  }, [refetchProposalAllocations]);

  if (!proposals || !shouldMatchedProposalRewardsBeAvailable) {
    return (
      <MainLayout
        classNameBody={styles.bodyLayout}
        isHeaderVisible={false}
        isLoading
        navigationTabs={getCustomNavigationTabs()}
      />
    );
  }

  if (!proposal || (proposal && proposal.isLoadingError)) {
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

  const buttonProps = allocations!.includes(proposalAddress!)
    ? {
        Icon: <Svg img={tick} size={1.5} />,
        label: 'Added to Allocate',
      }
    : {
        label: 'Add to Allocate',
      };

  return (
    <MainLayout
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
                <div>{getFormattedEthValue(proposalMatchedProposalRewards?.sum).fullString}</div>
                <div className={styles.separator} />
                <div
                  className={cx(
                    styles.percentage,
                    isDonationAboveThreshold && styles.isAboveThreshold,
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
          isSmallFont
          onClick={() => onAddRemoveFromAllocate(proposalAddress!)}
          variant="secondary"
          {...buttonProps}
        />
      </div>
      <div className={styles.body}>
        <Description text={description!} />
        <Button className={styles.buttonWebsite} href={website!.url} variant="link">
          {website!.label || website!.url}
        </Button>
      </div>
      <div className={styles.donors}>
        <div className={styles.header}>
          <span>Donors</span>{' '}
          {proposalAllocations && <div className={styles.count}>{proposalAllocations.length}</div>}
        </div>
        {proposalAllocations?.map(({ user }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className={styles.donor}>
            <Svg classNameSvg={styles.donorIcon} img={donorGenericIcon} size={2.4} />
            {truncateEthAddress(user)}
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default ProposalView;
