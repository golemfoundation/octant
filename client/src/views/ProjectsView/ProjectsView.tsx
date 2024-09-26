import React, {
  ReactElement,
  useState,
  useMemo,
  useLayoutEffect,
  useEffect,
  ChangeEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';

import ProjectsList from 'components/Projects/ProjectsList';
import TipTile from 'components/shared/TipTile';
import InputSelect from 'components/ui/InputSelect';
import InputText from 'components/ui/InputText';
import Loader from 'components/ui/Loader';
import Svg from 'components/ui/Svg';
import {
  WINDOW_PROJECTS_SCROLL_Y,
  WINDOW_PROJECTS_LOADED_ARCHIVED_EPOCHS_NUMBER,
} from 'constants/window';
import useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow from 'hooks/helpers/useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useTipsStore from 'store/tips/store';
import { magnifyingGlass } from 'svg/misc';

import styles from './ProjectsView.module.scss';
import { OrderOption } from './types';
import { ORDER_OPTIONS } from './utils';

const ProjectsView = (): ReactElement => {
  const { isDesktop } = useMediaQuery();
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.projects',
  });

  const { data: currentEpoch } = useCurrentEpoch();

  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // TODO OCT-1952: settle on when & how randomised order should work.
  const [orderOption, setOrderOption] = useState<OrderOption>(
    isDecisionWindowOpen ? 'randomized' : 'totalsDescending',
  );

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

  const onChangeSearchQuery = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

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

  const orderOptionsTranslated = ORDER_OPTIONS(t);

  return (
    <>
      {!areCurrentEpochsProjectsHiddenOutsideAllocationWindow && (
        <TipTile
          className={styles.tip}
          dataTest="ProjectsView__TipTile"
          image="images/favourites.webp"
          imageClassName={styles.favouritesImage}
          isOpen={isAddToFavouritesTipVisible}
          onClose={() => setWasAddFavouritesAlreadyClosed(true)}
          text={isDesktop ? t('tip.text.desktop') : t('tip.text.mobile')}
          title={t('tip.title')}
        />
      )}
      <div className={styles.searchAndFilter}>
        <InputText
          className={styles.inputSearch}
          dataTest="ProjectsList__InputText"
          Icon={<Svg img={magnifyingGlass} size={3.2} />}
          onChange={onChangeSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder={t('searchInputPlaceholder')}
          shouldAutoFocusAndSelect={false}
          value={searchQuery}
          variant="search"
        />
        <InputSelect
          className={styles.inputOrder}
          onChange={option => setOrderOption(option!.value as OrderOption)}
          // TODO OCT-1952: settle on when & how randomised order should work.
          options={
            isDecisionWindowOpen
              ? orderOptionsTranslated
              : orderOptionsTranslated.filter(element => element.value !== 'randomized')
          }
          selectedOption={orderOptionsTranslated.find(({ value }) => value === orderOption)}
          variant="underselect"
        />
      </div>
      {!areCurrentEpochsProjectsHiddenOutsideAllocationWindow && (
        <ProjectsList
          areCurrentEpochsProjectsHiddenOutsideAllocationWindow={
            areCurrentEpochsProjectsHiddenOutsideAllocationWindow
          }
          orderOption={orderOption}
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
              orderOption={orderOption}
            />
          ))}
        </InfiniteScroll>
      )}
    </>
  );
};

export default ProjectsView;
