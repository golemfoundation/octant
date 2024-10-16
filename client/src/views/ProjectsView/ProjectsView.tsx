import debounce from 'lodash/debounce';
import range from 'lodash/range';
import React, {
  ReactElement,
  useState,
  useMemo,
  useLayoutEffect,
  useEffect,
  ChangeEvent,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';

import ProjectsList from 'components/Projects/ProjectsList';
import ProjectsSearchResults from 'components/Projects/ProjectsSearchResults';
import ViewTitle from 'components/shared/ViewTitle/ViewTitle';
import InputSelect from 'components/ui/InputSelect';
import InputText from 'components/ui/InputText';
import Loader from 'components/ui/Loader';
import Svg from 'components/ui/Svg';
import {
  WINDOW_PROJECTS_SCROLL_Y,
  WINDOW_PROJECTS_LOADED_ARCHIVED_EPOCHS_NUMBER,
} from 'constants/window';
import useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow from 'hooks/helpers/useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useSearchedProjects from 'hooks/queries/useSearchedProjects';
import useSearchedProjectsDetails from 'hooks/queries/useSearchedProjectsDetails';
import { magnifyingGlass } from 'svg/misc';
import { ethAddress as ethAddressRegExp, epochNumberGrabber } from 'utils/regExp';

import styles from './ProjectsView.module.scss';
import { OrderOption, ProjectsSearchParameters } from './types';
import { ORDER_OPTIONS } from './utils';

const ProjectsView = (): ReactElement => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.projects',
  });

  const { data: currentEpoch } = useCurrentEpoch();

  const [searchQuery, setSearchQuery] = useState<string>('');
  // Helper hook, because actual fetch is called after debounce. Until then, loading state.
  const [isProjectsSearchInProgress, setIsProjectsSearchInProgress] = useState<boolean>(false);
  const [projectsSearchParameters, setProjectsSearchParameters] = useState<
    ProjectsSearchParameters | undefined
  >(undefined);

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

  const [loadedArchivedEpochsNumber, setLoadedArchivedEpochsNumber] = useState(() => {
    const projectsLoadedArchivedEpochsNumber =
      window[WINDOW_PROJECTS_LOADED_ARCHIVED_EPOCHS_NUMBER];

    return projectsLoadedArchivedEpochsNumber ?? 0;
  });

  const {
    data: searchedProjects,
    refetch: refetchSearchedProjects,
    status: statusSearchedProjects,
    isFetching: isFetchingSearchedProjects,
  } = useSearchedProjects(projectsSearchParameters);
  const {
    data: searchedProjectsDetails,
    refetch: refetchSearchedProjectsDetails,
    isFetching: isFetchingSearchedProjectsDetails,
  } = useSearchedProjectsDetails(searchedProjects);

  useEffect(() => {
    if (
      isProjectsSearchInProgress &&
      searchedProjects &&
      searchedProjects.length === 0 &&
      !isFetchingSearchedProjects
    ) {
      setIsProjectsSearchInProgress(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedProjects, isFetchingSearchedProjects]);

  useEffect(() => {
    if (isFetchingSearchedProjectsDetails) {
      return;
    }
    setIsProjectsSearchInProgress(false);
  }, [isFetchingSearchedProjectsDetails]);

  useEffect(() => {
    // Refetch is not required when no data already fetched.
    if (statusSearchedProjects !== 'success') {
      return;
    }
    refetchSearchedProjects().then(() => {
      refetchSearchedProjectsDetails();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedProjects, projectsSearchParameters?.epochs, projectsSearchParameters?.searchPhrases]);

  const setProjectsDetailsSearchParametersWrapper = (query: string) => {
    const epochNumbersMatched = [...query.matchAll(epochNumberGrabber)];

    const epochNumbers = epochNumbersMatched
      .map(match => match[1])
      .reduce((acc, curr) => {
        if (curr.includes('-')) {
          const borderNumbersInRange = curr
            .split('-')
            .map(Number)
            .sort((a, b) => a - b);
          const numbersInRange = range(borderNumbersInRange[0], borderNumbersInRange[1] + 1);
          return [...acc, ...numbersInRange];
        }
        return [...acc, Number(curr)];
      }, [] as number[]);

    const ethAddresses = query.match(ethAddressRegExp);

    let queryFiltered = query;
    ethAddresses?.forEach(element => {
      queryFiltered = queryFiltered.replace(element, '');
    });
    epochNumbersMatched?.forEach(element => {
      queryFiltered = queryFiltered.replace(element[0], '');
    });
    queryFiltered = queryFiltered.trim();

    setProjectsSearchParameters({
      epochs:
        epochNumbers.length > 0
          ? epochNumbers
          : Array.from({ length: currentEpoch! }, (_v, k) => k + 1),
      searchPhrases: queryFiltered.split(' ').concat(ethAddresses || []) || [''],
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setProjectsDetailsSearchParametersWrapperDebounced = useCallback(
    debounce(query => setProjectsDetailsSearchParametersWrapper(query), 1000, { trailing: true }),
    [],
  );

  const onChangeSearchQuery = (e: ChangeEvent<HTMLInputElement>): void => {
    const query = e.target.value;
    setSearchQuery(query);
    setProjectsDetailsSearchParametersWrapperDebounced(query);

    if (query !== '') {
      setIsProjectsSearchInProgress(true);
    }
  };

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
      <ViewTitle className={styles.viewTitle}>
        {t('viewTitle', {
          epochNumber:
            isDecisionWindowOpen ||
            (!isDecisionWindowOpen && areCurrentEpochsProjectsHiddenOutsideAllocationWindow)
              ? currentEpoch! - 1
              : currentEpoch,
        })}
      </ViewTitle>
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
      {searchQuery === '' && !areCurrentEpochsProjectsHiddenOutsideAllocationWindow && (
        <ProjectsList
          areCurrentEpochsProjectsHiddenOutsideAllocationWindow={
            areCurrentEpochsProjectsHiddenOutsideAllocationWindow
          }
          orderOption={orderOption}
        />
      )}
      {searchQuery !== '' && (
        <ProjectsSearchResults
          isLoading={isProjectsSearchInProgress}
          orderOption={orderOption}
          projectsIpfsWithRewardsAndEpochs={searchedProjectsDetails}
        />
      )}
      {searchQuery === '' && archivedEpochs.length > 0 && (
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
