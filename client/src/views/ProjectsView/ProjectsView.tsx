import React, { ReactElement, useState, useMemo, useLayoutEffect, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';

import ProjectsList from 'components/Projects/ProjectsList';
import ProjectsTimelineWidget from 'components/Projects/ProjectsTimelineWidget';
import Layout from 'components/shared/Layout';
import TipTile from 'components/shared/TipTile';
import Loader from 'components/ui/Loader';
import {
  WINDOW_PROJECTS_SCROLL_Y,
  WINDOW_PROJECTS_LOADED_ARCHIVED_EPOCHS_NUMBER,
} from 'constants/window';
import useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow from 'hooks/helpers/useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useTipsStore from 'store/tips/store';

import styles from './ProjectsView.module.scss';

const ProjectsView = (): ReactElement => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'views.projects',
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

  const [loadedArchivedEpochsNumber, setLoadedArchivedEpochsNumber] = useState(() => {
    const projectsLoadedArchivedEpochsNumber =
      window[WINDOW_PROJECTS_LOADED_ARCHIVED_EPOCHS_NUMBER];

    return projectsLoadedArchivedEpochsNumber ?? 0;
  });

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

  const onLoadNextEpochArchive = () => {
    setLoadedArchivedEpochsNumber(prev => {
      /**
       * While in CY, onLoadNextEpochArchive is sometimes called twice in a row for the same project.
       *
       * The reason for it is unknown, but without below check the same number can be loaded twice.
       * This results in random failure of the CY tests for projects view.
       *
       * During "normal" usage problem could not be reproduced,
       * yet might be possible, so better avoid that.
       *
       * Issue is not resolved in the library:
       * https://github.com/danbovey/react-infinite-scroller/issues/143
       */
      return loadedArchivedEpochsNumber !== prev ? prev : prev + 1;
    });
  };

  useLayoutEffect(() => {
    const projectsScrollY = window[WINDOW_PROJECTS_SCROLL_Y];
    if (!projectsScrollY) {
      return;
    }

    window.scrollTo({ top: projectsScrollY });
  }, []);

  useEffect(() => {
    return () => {
      window[WINDOW_PROJECTS_LOADED_ARCHIVED_EPOCHS_NUMBER] = loadedArchivedEpochsNumber;
    };
  }, [loadedArchivedEpochsNumber]);

  return (
    <Layout dataTest="ProjectsView">
      <ProjectsTimelineWidget />
      {!areCurrentEpochsProjectsHiddenOutsideAllocationWindow && (
        <TipTile
          className={styles.tip}
          dataTest="ProjectsView__TipTile"
          image="images/favourites.webp"
          infoLabel={i18n.t('common.gettingStarted')}
          isOpen={isAddToFavouritesTipVisible}
          onClose={() => setWasAddFavouritesAlreadyClosed(true)}
          text={t('tip.text')}
          title={t('tip.title')}
        />
      )}
      {!areCurrentEpochsProjectsHiddenOutsideAllocationWindow && (
        <ProjectsList
          areCurrentEpochsProjectsHiddenOutsideAllocationWindow={
            areCurrentEpochsProjectsHiddenOutsideAllocationWindow
          }
        />
      )}
      {archivedEpochs.length > 0 && (
        <InfiniteScroll
          className={styles.archives}
          hasMore={loadedArchivedEpochsNumber !== lastArchivedEpochNumber}
          initialLoad
          loader={
            <div key={-1} className={styles.loaderWrapper}>
              <Loader />
            </div>
          }
          loadMore={onLoadNextEpochArchive}
          pageStart={0}
          useWindow
        >
          {archivedEpochs.slice(0, loadedArchivedEpochsNumber).map((epoch, index) => (
            <ProjectsList
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
    </Layout>
  );
};

export default ProjectsView;
