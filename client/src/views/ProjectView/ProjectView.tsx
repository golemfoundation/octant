import { AnimatePresence } from 'framer-motion';
import throttle from 'lodash/throttle';
import React, { ReactElement, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import ProjectBackToTopButton from 'components/Project/ProjectBackToTopButton';
import ProjectList from 'components/Project/ProjectList';
import Layout from 'components/shared/Layout';
import Loader from 'components/ui/Loader';
import useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow from 'hooks/helpers/useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import useProjectsIpfsWithRewards, {
  ProjectIpfsWithRewards,
} from 'hooks/queries/useProjectsIpfsWithRewards';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import toastService from 'services/toastService';

import styles from './ProjectView.module.scss';

const ProjectView = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.project' });
  const [isBackToTopButtonVisible, setIsBackToTopButtonVisible] = useState(false);
  const { projectAddress: projectAddressUrl, epoch: epochUrl } = useParams();
  const [loadedProjects, setLoadedProjects] = useState<ProjectIpfsWithRewards[]>([]);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: areCurrentEpochsProjectsHiddenOutsideAllocationWindow } =
    useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow();
  const { data: currentEpoch } = useCurrentEpoch();
  const epochUrlInt = parseInt(epochUrl!, 10);

  const epoch = useMemo(() => {
    if (isDecisionWindowOpen) {
      return epochUrlInt === currentEpoch! - 1 ? undefined : epochUrlInt;
    }
    return epochUrlInt === currentEpoch ? undefined : epochUrlInt;
  }, [isDecisionWindowOpen, epochUrlInt, currentEpoch]);

  const { data: matchedProjectRewards } = useMatchedProjectRewards(epoch);
  const { data: projectsIpfsWithRewards } = useProjectsIpfsWithRewards(epoch);

  const isEpoch1 = currentEpoch === 1;
  const areMatchedProjectsReady =
    !!currentEpoch &&
    ((currentEpoch > 1 && matchedProjectRewards) || isEpoch1 || !isDecisionWindowOpen);
  const initialElement = loadedProjects[0] || {};

  const onLoadNextProject = () => {
    if (!loadedProjects.length || !projectsIpfsWithRewards.length) {
      return;
    }

    const lastItemIndex = projectsIpfsWithRewards.findIndex(
      el => el.address === loadedProjects[loadedProjects.length - 1].address,
    );
    const nextItemIndex =
      lastItemIndex === projectsIpfsWithRewards.length - 1 ? 0 : lastItemIndex + 1;
    const nextItem = projectsIpfsWithRewards[nextItemIndex];

    /**
     * While in CY, onLoadNextProject is sometimes called twice in a row for the same project.
     *
     * The reason for it is unknown, but without below check the same project can be loaded twice.
     * This results in random failure of the CY tests for project view.
     *
     * During "normal" usage problem could not be reproduced,
     * yet might be possible, so better avoid that.
     *
     * Issue is not resolved in the library:
     * https://github.com/danbovey/react-infinite-scroller/issues/143
     */
    if (loadedProjects.findIndex(p => p.address === nextItem.address) < 0) {
      setLoadedProjects(prev =>
        [...prev, nextItem].filter(
          (element, index, self) =>
            index === self.findIndex(element2 => element2.address === element.address),
        ),
      );
    }
  };

  useEffect(() => {
    if (!projectsIpfsWithRewards.length) {
      return;
    }
    const firstProject = projectsIpfsWithRewards.find(p => p.address === projectAddressUrl);
    setLoadedProjects([firstProject!]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsIpfsWithRewards.length]);

  useEffect(() => {
    if (
      !loadedProjects.length ||
      !projectsIpfsWithRewards.length ||
      loadedProjects.length !== projectsIpfsWithRewards.length
    ) {
      return;
    }

    const target = document.querySelector(
      `[data-index="${projectsIpfsWithRewards.length - 1}"]`,
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
  }, [loadedProjects.length, projectsIpfsWithRewards.length]);

  if (!initialElement || !areMatchedProjectsReady || projectsIpfsWithRewards.length === 0) {
    return <Layout isLoading />;
  }

  if (
    !initialElement ||
    (initialElement && initialElement.isLoadingError) ||
    (areCurrentEpochsProjectsHiddenOutsideAllocationWindow && epochUrl === currentEpoch.toString())
  ) {
    toastService.showToast({
      name: 'projectLoadingProblem',
      title: t('loadingProblem'),
      type: 'warning',
    });
    return (
      <Routes>
        <Route element={<Navigate to={ROOT_ROUTES.projects.absolute} />} path="*" />
      </Routes>
    );
  }

  return (
    <>
      <InfiniteScroll
        hasMore={loadedProjects?.length !== projectsIpfsWithRewards?.length}
        initialLoad
        loader={
          <div key={-1} className={styles.loaderWrapper}>
            <Loader dataTest="ProjectView__Loader" />
          </div>
        }
        loadMore={onLoadNextProject}
        pageStart={0}
        useWindow
      >
        <ProjectList epoch={epoch} projects={loadedProjects} />
      </InfiniteScroll>
      <AnimatePresence>{isBackToTopButtonVisible && <ProjectBackToTopButton />}</AnimatePresence>
    </>
  );
};

export default ProjectView;
