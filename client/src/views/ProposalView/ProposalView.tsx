import { AnimatePresence } from 'framer-motion';
import throttle from 'lodash/throttle';
import React, { ReactElement, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import ProposalBackToTopButton from 'components/Proposal/ProposalBackToTopButton';
import ProposalList from 'components/Proposal/ProposalList';
import Layout from 'components/shared/Layout';
import Loader from 'components/ui/Loader';
import { navigationTabs as navigationTabsDefault } from 'constants/navigationTabs/navigationTabs';
import useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow from 'hooks/helpers/useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalsIpfsWithRewards, {
  ProposalIpfsWithRewards,
} from 'hooks/queries/useProposalsIpfsWithRewards';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import toastService from 'services/toastService';
import { chevronLeft } from 'svg/navigation';

import styles from './ProposalView.module.scss';

const ProposalView = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.proposal' });
  const [isBackToTopButtonVisible, setIsBackToTopButtonVisible] = useState(false);
  const { proposalAddress: proposalAddressUrl, epoch: epochUrl } = useParams();
  const [loadedProposals, setLoadedProposals] = useState<ProposalIpfsWithRewards[]>([]);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: areCurrentEpochsProjectsHiddenOutsideAllocationWindow } =
    useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow();
  const { data: currentEpoch } = useCurrentEpoch();
  const epochUrlInt = parseInt(epochUrl!, 10);

  const epoch = isDecisionWindowOpen && epochUrlInt === currentEpoch! - 1 ? undefined : epochUrlInt;

  const { data: matchedProposalRewards } = useMatchedProposalRewards(epoch);
  const { data: proposalsIpfsWithRewards } = useProposalsIpfsWithRewards(epoch);

  const navigationTabs = useMemo(() => {
    const navTabs = [...navigationTabsDefault];
    navTabs[0] = {
      ...navTabs[0],
      icon: chevronLeft,
      isActive: true,
    };
    return navTabs;
  }, []);

  const isEpoch1 = currentEpoch === 1;
  const areMatchedProposalsReady =
    !!currentEpoch &&
    ((currentEpoch > 1 && matchedProposalRewards) || isEpoch1 || !isDecisionWindowOpen);
  const initialElement = loadedProposals[0] || {};

  const onLoadNextProposal = () => {
    if (!loadedProposals.length || !proposalsIpfsWithRewards.length) {
      return;
    }

    const lastItemIndex = proposalsIpfsWithRewards.findIndex(
      el => el.address === loadedProposals[loadedProposals.length - 1].address,
    );
    const nextItemIndex =
      lastItemIndex === proposalsIpfsWithRewards.length - 1 ? 0 : lastItemIndex + 1;
    const nextItem = proposalsIpfsWithRewards[nextItemIndex];

    /**
     * While in CY, onLoadNextProposal is sometimes called twice in a row for the same proposal.
     *
     * The reason for it is unknown, but without below check the same proposal can be loaded twice.
     * This results in random failure of the CY tests for project view.
     *
     * During "normal" usage problem could not be reproduced,
     * yet might be possible, so better avoid that.
     *
     * Issue is not resolved in the library:
     * https://github.com/danbovey/react-infinite-scroller/issues/143
     */
    if (loadedProposals.findIndex(p => p.address === nextItem.address) < 0) {
      setLoadedProposals(prev =>
        [...prev, nextItem].filter(
          (element, index, self) =>
            index === self.findIndex(element2 => element2.address === element.address),
        ),
      );
    }
  };

  useEffect(() => {
    if (!proposalsIpfsWithRewards.length) {
      return;
    }
    const firstProposal = proposalsIpfsWithRewards.find(p => p.address === proposalAddressUrl);
    setLoadedProposals([firstProposal!]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalsIpfsWithRewards.length]);

  useEffect(() => {
    if (
      !loadedProposals.length ||
      !proposalsIpfsWithRewards.length ||
      loadedProposals.length !== proposalsIpfsWithRewards.length
    ) {
      return;
    }

    const target = document.querySelector(
      `[data-index="${proposalsIpfsWithRewards.length - 1}"]`,
    ) as HTMLDivElement | undefined;

    if (!target) {
      return;
    }

    const listener = throttle(() => {
      const showBackToTop =
        window.scrollY + window.innerHeight >= target.offsetTop + target.offsetHeight / 2;

      setIsBackToTopButtonVisible(showBackToTop);
    }, 100);

    document.addEventListener('scroll', listener);

    return () => {
      document.removeEventListener('scroll', listener);
    };
  }, [loadedProposals.length, proposalsIpfsWithRewards.length]);

  if (!initialElement || !areMatchedProposalsReady || proposalsIpfsWithRewards.length === 0) {
    return <Layout isLoading navigationTabs={navigationTabs} />;
  }

  if (
    !initialElement ||
    (initialElement && initialElement.isLoadingError) ||
    (areCurrentEpochsProjectsHiddenOutsideAllocationWindow && epochUrl === currentEpoch.toString())
  ) {
    toastService.showToast({
      name: 'proposalLoadingProblem',
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
    <Layout
      classNameBody={styles.mainLayoutBody}
      dataTest="ProposalView"
      navigationTabs={navigationTabs}
    >
      <InfiniteScroll
        hasMore={loadedProposals?.length !== proposalsIpfsWithRewards?.length}
        initialLoad
        loader={
          <div key={-1} className={styles.loaderWrapper}>
            <Loader dataTest="ProposalView__Loader" />
          </div>
        }
        loadMore={onLoadNextProposal}
        pageStart={0}
        useWindow
      >
        <ProposalList epoch={epoch} proposals={loadedProposals} />
      </InfiniteScroll>
      <AnimatePresence>{isBackToTopButtonVisible && <ProposalBackToTopButton />}</AnimatePresence>
    </Layout>
  );
};

export default ProposalView;
