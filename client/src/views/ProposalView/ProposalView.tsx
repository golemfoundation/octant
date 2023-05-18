import React, { ReactElement, Fragment, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import Button from 'components/core/Button/Button';
import Description from 'components/core/Description/Description';
import Img from 'components/core/Img/Img';
import Loader from 'components/core/Loader/Loader';
import ButtonAddToAllocate from 'components/dedicated/ButtonAddToAllocate/ButtonAddToAllocate';
import DonorsList from 'components/dedicated/DonorsList/DonorsList';
import ProposalRewards from 'components/dedicated/ProposalRewards/ProposalRewards';
import { navigationTabs as navigationTabsDefault } from 'constants/navigationTabs/navigationTabs';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import useProposalsWithRewards from 'hooks/queries/useProposalsWithRewards';
import MainLayout from 'layouts/MainLayout/MainLayout';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';
import { chevronLeft } from 'svg/navigation';
import { ExtendedProposal } from 'types/proposals';
import triggerToast from 'utils/triggerToast';

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
  const { t } = useTranslation('translation', { keyPrefix: 'views.proposal' });
  const { ipfsGateway } = env;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadedAddresses, setLoadedAddresses] = useState<string[]>([]);
  const [loadedProposals, setLoadedProposals] = useState<ExtendedProposal[]>([]);
  const { proposalAddress: proposalAddressUrl } = useParams();
  const { data: allocations, setAllocations } = useAllocationsStore();
  const { data: proposalsIpfs } = useProposalsIpfs(loadedAddresses!);
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const proposalsWithRewards = useProposalsWithRewards();

  useEffect(() => {
    if (loadedAddresses.length === 0) {
      setLoadedAddresses([proposalAddressUrl!]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      proposalsIpfs &&
      proposalsIpfs.length > 0 &&
      loadedProposals.length !== proposalsIpfs.length
    ) {
      setLoadedProposals(proposalsIpfs);
      setIsLoading(false);
    }
  }, [loadedProposals, proposalsIpfs, setLoadedProposals]);

  useEffect(() => {
    if (
      !isLoading ||
      loadedAddresses.length === 0 ||
      loadedProposals.length === 0 ||
      proposalsWithRewards.length === 0
    ) {
      return;
    }

    const initialElement = loadedProposals[0];
    const currentElement = proposalsWithRewards!.find(
      ({ address }) => address === loadedAddresses[loadedAddresses.length - 1],
    );
    const currentElementIndex = proposalsWithRewards.indexOf(currentElement!);
    const isFirstProposalLoaded = !!loadedProposals.find(
      ({ address }) => address === proposalsWithRewards![0].address,
    );

    if (
      currentElementIndex < proposalsWithRewards.length - 1 &&
      loadedProposals.length < proposalsWithRewards.length &&
      !isFirstProposalLoaded
    ) {
      const nextIndex = 0;
      const nextAddress = proposalsWithRewards[nextIndex].address;
      setLoadedAddresses(prevLoadedAddresses => [...prevLoadedAddresses, nextAddress]);
      return;
    }

    let nextIndex =
      currentElementIndex < proposalsWithRewards!.length - 1
        ? currentElementIndex + 1
        : (proposalsWithRewards!.length % currentElementIndex) - 1;
    let nextAddress = proposalsWithRewards[nextIndex].address;

    /**
     * During first iteration we want to skip initialElement.
     * When user enters project index number 2, next ones are 0, 1, 3, ..., n - 1, n, 0, 1, 2, ...
     * Triggers when initialElement is not the first one.
     */

    if (
      nextAddress !== initialElement.address ||
      loadedProposals.length >= proposalsWithRewards.length
    ) {
      setLoadedAddresses(prevLoadedAddresses => [...prevLoadedAddresses, nextAddress]);
      return;
    }

    nextIndex += 1;
    nextAddress = proposalsWithRewards[nextIndex].address;
    setLoadedAddresses(prevLoadedAddresses => [...prevLoadedAddresses, nextAddress]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const onLoadNextProposal = () => {
    // isLoading prevents onLoadNextProposal from being called infinitely.
    if (
      isLoading ||
      loadedAddresses.length === 0 ||
      loadedProposals.length === 0 ||
      proposalsWithRewards.length === 0
    ) {
      return;
    }

    setIsLoading(true);
  };

  const shouldMatchedProposalRewardsBeAvailable =
    !!currentEpoch && ((currentEpoch > 1 && matchedProposalRewards) || currentEpoch === 1);
  const initialElement = loadedProposals[0] || {};

  if (!initialElement || !shouldMatchedProposalRewardsBeAvailable) {
    return <MainLayout isLoading navigationTabs={getCustomNavigationTabs()} />;
  }

  if (!initialElement || (initialElement && initialElement.isLoadingError)) {
    triggerToast({
      title: t('loadingProblem'),
      type: 'warning',
    });
    return (
      <Routes>
        <Route element={<Navigate to={ROOT_ROUTES.proposals.absolute} />} path="*" />
      </Routes>
    );
  }

  return (
    <MainLayout dataTest="ProposalView" navigationTabs={getCustomNavigationTabs()}>
      <InfiniteScroll
        hasMore
        initialLoad
        loader={
          <div key={-1} className={styles.loaderWrapper}>
            <Loader />
          </div>
        }
        loadMore={onLoadNextProposal}
        pageStart={0}
        useWindow
      >
        {loadedProposals.map(({ address, description, name, profileImageCID, website }, index) => {
          const isAlreadyAdded = allocations!.includes(address);
          const proposalMatchedProposalRewards = proposalsWithRewards?.find(
            ({ address: matchedAddress }) => matchedAddress === address,
          );
          const { onAddRemoveFromAllocate } = useIdsInAllocation({
            allocations: allocations!,
            proposalName: name,
            setAllocations,
          });
          return (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={`${address}-${index}`}>
              <div className={styles.proposal} data-test="ProposalView__proposal">
                <div className={styles.proposalHeader}>
                  <div className={styles.imageProfileWrapper}>
                    <Img
                      className={styles.imageProfile}
                      dataTest="ProposalView__proposal__Img"
                      src={`${ipfsGateway}${profileImageCID}`}
                    />
                    <ButtonAddToAllocate
                      className={styles.buttonAddToAllocateMobile}
                      isAlreadyAdded={isAlreadyAdded}
                      onClick={() => onAddRemoveFromAllocate(address)}
                    />
                  </div>
                  <span className={styles.name} data-test="ProposalView__proposal__name">
                    {name}
                  </span>
                  <Button
                    className={styles.buttonWebsite}
                    dataTest="ProposalView__proposal__Button"
                    href={website!.url}
                    variant="link5"
                  >
                    {website!.label || website!.url}
                  </Button>
                  <ProposalRewards
                    canFoundedAtHide={false}
                    className={styles.proposalRewards}
                    MiddleElement={
                      <ButtonAddToAllocate
                        className={styles.buttonAddToAllocateDesktop}
                        dataTest="ProposalView__proposal__ButtonAddToAllocate"
                        isAlreadyAdded={isAlreadyAdded}
                        onClick={() => onAddRemoveFromAllocate(address)}
                      />
                    }
                    totalValueOfAllocations={
                      proposalMatchedProposalRewards?.totalValueOfAllocations
                    }
                  />
                </div>
                <div className={styles.body}>
                  <Description
                    dataTest="ProposalView__proposal__Description"
                    text={description!}
                    variant="big"
                  />
                </div>
              </div>
              <DonorsList
                className={styles.donors}
                dataTest="ProposalView__proposal__DonorsList"
                proposalAddress={address}
              />
            </Fragment>
          );
        })}
      </InfiniteScroll>
    </MainLayout>
  );
};

export default ProposalView;
