import { BigNumber } from 'ethers';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import React, { ReactElement } from 'react';

import { chevronLeft } from 'svg/navigation';
import { navigationTabs as navigationTabsDefault } from 'constants/navigationTabs/navigationTabs';
import { tick } from 'svg/misc';
import { useIdInAllocation } from 'hooks/useIdInAllocation';
import { useIpfsProposals } from 'hooks/useIpfsProposals';
import { useProposalsContract } from 'hooks/useContract';
import Button from 'components/core/button/button.component';
import Img from 'components/core/img/img.component';
import MainLayout from 'layouts/main-layout/main.layout';
import Svg from 'components/core/svg/svg.component';
import env from 'env';

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

const ProposalView = (): ReactElement => {
  const { proposalId } = useParams();
  const proposalIdNumber = parseInt(proposalId!, 10);
  const { proposalsAddress } = env;
  const contractProposals = useProposalsContract(proposalsAddress);
  const [isAddedToAllocate, onAddRemoveFromAllocate] = useIdInAllocation(proposalIdNumber);

  const { data: baseUri } = useQuery(['baseUri'], () => contractProposals?.baseURI(), {
    enabled: !!contractProposals,
  });
  const [proposals] = useIpfsProposals(
    baseUri ? [{ id: BigNumber.from(proposalId!), uri: `${baseUri}${proposalId}` }] : undefined,
  );
  const [proposal] = proposals;

  if (true) {
    return (
      <MainLayout
        classNameBody={styles.bodyLayout}
        isHeaderVisible={false}
        isLoading
        navigationTabs={getCustomNavigationTabs()}
      />
    );
  }

  const { description, landscapeImageUrl, name, profileImageUrl, website } = proposal;

  const buttonProps = isAddedToAllocate
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
        landscapeImageUrl && (
          <div className={styles.imageLandscapeWrapper}>
            <Img className={styles.imageLandscape} src={landscapeImageUrl} />
          </div>
        )
      }
      navigationTabs={getCustomNavigationTabs()}
    >
      <div className={styles.header}>
        <Img className={styles.imageProfile} src={profileImageUrl} />
        <div className={styles.nameAndAllocationValues}>
          <span className={styles.name}>{name}</span>
          <div className={styles.allocationValues}>
            <div>$5300</div>
            <div className={styles.separator} />
            <div>32%</div>
          </div>
        </div>
      </div>
      <Button
        className={styles.buttonAllocate}
        onClick={() => onAddRemoveFromAllocate(proposalIdNumber)}
        {...buttonProps}
      />
      <div className={styles.body}>
        <div>{description}</div>
        <Button className={styles.buttonWebsite} href={website.url} variant="link">
          {website.label || website.url}
        </Button>
      </div>
    </MainLayout>
  );
};

export default ProposalView;
