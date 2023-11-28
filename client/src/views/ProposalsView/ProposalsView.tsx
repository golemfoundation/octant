import React, { ReactElement, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';

import Loader from 'components/core/Loader/Loader';
import ProposalsList from 'components/dedicated/ProposalsList/ProposalsList';
import TipTile from 'components/dedicated/TipTile/TipTile';
import useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow from 'hooks/helpers/useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useTipsStore from 'store/tips/store';

import styles from './ProposalsView.module.scss';

const ProposalsView = (): ReactElement => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'views.proposals',
  });
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const { data: areCurrentEpochsProjectsHiddenOutsideAllocationWindow } =
    useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow();
  const { wasAddFavouritesAlreadyClosed, setWasAddFavouritesAlreadyClosed } = useTipsStore(
    state => ({
      setWasAddFavouritesAlreadyClosed: state.setWasAddFavouritesAlreadyClosed,
      wasAddFavouritesAlreadyClosed: state.data.wasAddFavouritesAlreadyClosed,
    }),
  );

  const [loadedArchivedEpochsNumber, setLoadedArchivedEpochsNumber] = useState(0);

  const isEpoch1 = currentEpoch === 1;

  const isAddToFavouritesTipVisible = !wasAddFavouritesAlreadyClosed && !isEpoch1;

  const lastArchivedEpochNumber = useMemo(() => {
    if (!currentEpoch || currentEpoch < 2) {
      return undefined;
    }
    return isDecisionWindowOpen ? currentEpoch! - 2 : currentEpoch! - 1;
  }, [currentEpoch, isDecisionWindowOpen]);

  const archivedEpochs = lastArchivedEpochNumber
    ? Array.from(Array(lastArchivedEpochNumber)).map((_, idx, array) => array.length - idx)
    : [];

  const onLoadNextEpochArchive = () => setLoadedArchivedEpochsNumber(prev => prev + 1);

  return (
    <MainLayout dataTest="ProposalsView">
      {!areCurrentEpochsProjectsHiddenOutsideAllocationWindow && (
        <TipTile
          className={styles.tip}
          dataTest="ProposalsView__TipTile"
          image="images/favourites.webp"
          infoLabel={i18n.t('common.gettingStarted')}
          isOpen={isAddToFavouritesTipVisible}
          onClose={() => setWasAddFavouritesAlreadyClosed(true)}
          text={t('tip.text')}
          title={t('tip.title')}
        />
      )}
      {!areCurrentEpochsProjectsHiddenOutsideAllocationWindow && (
        <ProposalsList
          areCurrentEpochsProjectsHiddenOutsideAllocationWindow={
            areCurrentEpochsProjectsHiddenOutsideAllocationWindow
          }
        />
      )}
      {archivedEpochs.length > 0 && (
        <InfiniteScroll
          hasMore={loadedArchivedEpochsNumber !== lastArchivedEpochNumber}
          initialLoad
          loader={
            <div key={-1} className={styles.loaderWrapper}>
              <Loader dataTest="ProposalsViem__Loader--archive" />
            </div>
          }
          loadMore={onLoadNextEpochArchive}
          pageStart={0}
          useWindow
        >
          {archivedEpochs.slice(0, loadedArchivedEpochsNumber).map((epoch, index) => (
            <ProposalsList
              key={epoch}
              areCurrentEpochsProjectsHiddenOutsideAllocationWindow={
                areCurrentEpochsProjectsHiddenOutsideAllocationWindow
              }
              epoch={epoch}
              isFirstArchive={index === 0}
            />
          ))}
        </InfiniteScroll>
      )}
    </MainLayout>
  );
};

export default ProposalsView;
