import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import React, { FC } from 'react';
import cx from 'classnames';

import { ROOT_ROUTES } from 'routes/root-routes/routes';
import { chevronLeft } from 'svg/navigation';
import { donorGenericIcon, tick } from 'svg/misc';
import { navigationTabs as navigationTabsDefault } from 'constants/navigationTabs/navigationTabs';
import Button from 'components/core/button/button.component';
import Description from 'components/core/description/description.component';
import Img from 'components/core/img/img.component';
import MainLayout from 'layouts/main-layout/main.layout.container';
import Svg from 'components/core/svg/svg.component';
import env from 'env';
import isAboveProposalDonationThresholdPercent from 'utils/isAboveProposalDonationThresholdPercent';
import triggerToast from 'utils/triggerToast';
import truncateEthAddress from 'utils/truncateEthAddress';
import useIdsInAllocation from 'hooks/useIdsInAllocation';
import useMatchedProposalRewards from 'hooks/useMatchedProposalRewards';
import useProjectDonors from 'hooks/useProjectDonors';
import useProposals from 'hooks/useProposals';

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
  const [proposals] = useProposals();
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const { data: userAlphas } = useProjectDonors(proposalId!);
  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ id }) => id.toString() === proposalId,
  );
  const proposal = proposals.find(({ id }) => id.toNumber() === proposalIdNumber);

  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    allocations,
    proposalName: proposal && proposal.name,
  });

  if (!proposal || !proposalMatchedProposalRewards) {
    return (
      <MainLayout
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
        variant: 'secondaryGrey',
      }
    : {
        label: 'Add to Allocate',
        variant: 'secondary',
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
            <div>{proposalMatchedProposalRewards.sum} ETH</div>
            <div className={styles.separator} />
            <div
              className={cx(
                styles.percentage,
                isAboveProposalDonationThresholdPercent(
                  proposalMatchedProposalRewards.percentage,
                ) && styles.isAboveThreshold,
              )}
            >
              {proposalMatchedProposalRewards.percentage} %
            </div>
          </div>
        </div>
      </div>
      <Button
        className={styles.buttonAllocate}
        onClick={() => onAddRemoveFromAllocate(proposalIdNumber)}
        {...buttonProps}
      />
      <div className={styles.body}>
        <Description text={description} />
        <Button className={styles.buttonWebsite} href={website.url} variant="link">
          {website.label || website.url}
        </Button>
      </div>
      <div className={styles.donors}>
        <div className={styles.header}>
          Donors {userAlphas && <div className={styles.count}>{userAlphas.length}</div>}
        </div>
        {userAlphas &&
          userAlphas.map(({ address }, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className={styles.donor}>
              <Svg classNameSvg={styles.donorIcon} img={donorGenericIcon} size={2.4} />
              {truncateEthAddress(address)}
            </div>
          ))}
      </div>
    </MainLayout>
  );
};

export default ProposalView;
