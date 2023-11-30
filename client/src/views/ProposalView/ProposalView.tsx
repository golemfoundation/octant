import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import throttle from 'lodash/throttle';
import React, { ReactElement, Fragment, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import Donors from 'components/Proposal/ProposalDonors/ProposalDonors';
import ButtonAddToAllocate from 'components/shared/ButtonAddToAllocate';
import Layout from 'components/shared/Layout';
import Rewards from 'components/shared/Rewards';
import Button from 'components/ui/Button';
import Description from 'components/ui/Description';
import Img from 'components/ui/Img';
import Loader from 'components/ui/Loader';
import Svg from 'components/ui/Svg';
import Tooltip from 'components/ui/Tooltip';
import { navigationTabs as navigationTabsDefault } from 'constants/navigationTabs/navigationTabs';
import env from 'env';
import useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow from 'hooks/helpers/useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import useProposalsIpfsWithRewards from 'hooks/queries/useProposalsIpfsWithRewards';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import i18n from 'i18n';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';
import { arrowRight, share } from 'svg/misc';
import { chevronLeft } from 'svg/navigation';
import { ExtendedProposal } from 'types/extended-proposal';
import decodeBase64ToUtf8 from 'utils/decodeBase64ToUtf8';
import triggerToast from 'utils/triggerToast';

import styles from './ProposalView.module.scss';

const ProposalView = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.proposal' });
  const { ipfsGateway } = env;
  const [isBackToTopButtonVisible, setIsBackToTopButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadedAddresses, setLoadedAddresses] = useState<string[]>([]);
  const [loadedProposals, setLoadedProposals] = useState<ExtendedProposal[]>([]);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const { proposalAddress: proposalAddressUrl, epoch: epochUrl } = useParams();
  const { allocations, setAllocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
    setAllocations: state.setAllocations,
  }));
  const { data: proposalsIpfs } = useProposalsIpfs(loadedAddresses!);
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: userAllocations } = useUserAllocations();
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: proposalsIpfsWithRewards } = useProposalsIpfsWithRewards();
  const { data: areCurrentEpochsProjectsHiddenOutsideAllocationWindow } =
    useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow();

  const isArchivedProposal =
    epochUrl && currentEpoch ? parseInt(epochUrl!, 10) < currentEpoch : false;

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
    if (!isLoading) {
      return;
    }

    const lastItemIndex = proposalsIpfsWithRewards.findIndex(
      el => el.address === loadedProposals[loadedProposals.length - 1].address,
    );
    const nextItemIndex =
      lastItemIndex === proposalsIpfsWithRewards.length - 1 ? 0 : lastItemIndex + 1;
    const nextAddress = proposalsIpfsWithRewards[nextItemIndex].address;

    /**
     * While in CY, onLoadNextProposal is sometimes called twice in a row for the same proposal.
     *
     * The reason for it is unknown, but without below check the same proposal can be loaded twice.
     * This results in random failure of the CY tests for project view.
     *
     * During "normal" usage problem could not be reproduced,
     * yet might be possible, so better avoid that.
     */
    if (!loadedAddresses.includes(nextAddress)) {
      setLoadedAddresses(prevLoadedAddresses => [...prevLoadedAddresses, nextAddress]);
    }

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const onLoadNextProposal = () => {
    if (
      isLoading ||
      loadedAddresses.length === 0 ||
      loadedProposals.length === 0 ||
      proposalsIpfsWithRewards.length === 0
    ) {
      return;
    }

    setIsLoading(true);
  };

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

  const onShareClick = ({ name, address }): boolean | Promise<boolean> => {
    const { origin } = window.location;
    const url = `${origin}${ROOT_ROUTES.proposal.absolute}/${epochUrl}/${address}`;

    if ((window.navigator.share as any) && !window.navigator.userAgent.includes('Macintosh')) {
      window.navigator.share({
        title: i18n.t('meta.fundrasingOnOctant', {
          projectName: name,
        }),
        url,
      });

      return false;
    }

    return window.navigator.clipboard.writeText(url).then(() => {
      setIsLinkCopied(true);

      setTimeout(() => {
        setIsLinkCopied(false);
      }, 1000);
      return true;
    });
  };

  useEffect(() => {
    if (
      !loadedProposals.length ||
      !proposalsIpfsWithRewards.length ||
      loadedProposals.length !== proposalsIpfsWithRewards.length
    ) {
      return;
    }

    const target = document.querySelector(
      `.ProposalView__proposal__Description--${proposalsIpfsWithRewards.length - 1}`,
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

  if (!initialElement || !areMatchedProposalsReady) {
    return <Layout isLoading navigationTabs={navigationTabs} />;
  }

  if (
    !initialElement ||
    (initialElement && initialElement.isLoadingError) ||
    (areCurrentEpochsProjectsHiddenOutsideAllocationWindow && epochUrl === currentEpoch.toString())
  ) {
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
        {loadedProposals.map(
          ({ address, description, name, profileImageSmall, website }, index) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { onAddRemoveFromAllocate } = useIdsInAllocation({
              allocations: allocations!,
              setAllocations,
              userAllocationsElements: userAllocations?.elements,
            });
            const buttonAddToAllocateProps = {
              isAddedToAllocate: allocations.includes(address),
              isAllocatedTo: !!userAllocations?.elements.find(
                ({ address: userAllocationAddress }) => userAllocationAddress === address,
              ),
              isArchivedProposal,
              onClick: () => onAddRemoveFromAllocate(address),
            };
            const proposalIpfsWithRewards = proposalsIpfsWithRewards.find(
              element => element.address === address,
            )!;
            return (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={`${address}-${index}`}>
                <div className={styles.proposal} data-test="ProposalView__proposal">
                  <div className={styles.proposalHeader}>
                    <div className={styles.imageProfileWrapper}>
                      <Img
                        className={styles.imageProfile}
                        dataTest="ProposalView__proposal__Img"
                        src={`${ipfsGateway}${profileImageSmall}`}
                      />
                      <div className={styles.actionsWrapper}>
                        <Tooltip
                          className={styles.tooltip}
                          hideAfterClick
                          onClickCallback={() => {
                            onShareClick({
                              address,
                              name,
                            });
                          }}
                          text={isLinkCopied ? i18n.t('common.copied') : i18n.t('common.copy')}
                          variant="small"
                        >
                          <Svg
                            classNameSvg={cx(styles.shareIcon, isLinkCopied && styles.isCopied)}
                            img={share}
                            size={3.2}
                          />
                        </Tooltip>
                        <ButtonAddToAllocate
                          className={cx(styles.buttonAddToAllocate, isEpoch1 && styles.isEpoch1)}
                          dataTest="ProposalView__proposal__ButtonAddToAllocate"
                          {...buttonAddToAllocateProps}
                        />
                      </div>
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
                    {!isEpoch1 ? (
                      <Rewards
                        address={address}
                        className={styles.proposalRewards}
                        epoch={isArchivedProposal ? parseInt(epochUrl!, 10) : undefined}
                        isProposalView
                        numberOfDonors={proposalIpfsWithRewards.numberOfDonors}
                        totalValueOfAllocations={proposalIpfsWithRewards.totalValueOfAllocations}
                      />
                    ) : (
                      <div className={styles.divider} />
                    )}
                  </div>
                  <div className={styles.body}>
                    <Description
                      className={`ProposalView__proposal__Description--${index}`}
                      dataTest="ProposalView__proposal__Description"
                      innerHtml={decodeBase64ToUtf8(description!)}
                      variant="big"
                    />
                  </div>
                </div>
                <Donors
                  className={styles.donors}
                  dataTest="ProposalView__proposal__Donors"
                  proposalAddress={address}
                />
              </Fragment>
            );
          },
        )}
      </InfiniteScroll>
      <AnimatePresence>
        {isBackToTopButtonVisible && (
          <motion.div
            animate={{ opacity: 1 }}
            className={styles.backToTopWrapper}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Button
              className={styles.backToTop}
              dataTest="ProposalView__proposal__ButtonBackToTop"
              onClick={() => {
                window.scrollTo({ behavior: 'smooth', top: 0 });
              }}
              variant="cta"
            >
              {t('backToTop')}
              <Svg classNameSvg={styles.backToTopIcon} img={arrowRight} size={1.2} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ProposalView;
