import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

import ProjectsListSkeletonItem from 'components/Projects/ProjectsListSkeletonItem/ProjectsListSkeletonItem';
import ButtonAddToAllocate from 'components/shared/ButtonAddToAllocate';
import Rewards from 'components/shared/Rewards';
import Description from 'components/ui/Description';
import Img from 'components/ui/Img';
import TinyLabel from 'components/ui/TinyLabel';
import { TOURGUIDE_ELEMENT_7 } from 'constants/domElementsIds';
import { WINDOW_PROJECTS_SCROLL_Y } from 'constants/window';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useIsAddToAllocateButtonVisible from 'hooks/helpers/useIsAddToAllocateButtonVisible';
import useIsAllocatedTo from 'hooks/helpers/useIsAllocatedTo';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';

import styles from './ProjectsListItem.module.scss';
import ProjectsListItemProps from './types';

const ProjectsListItem: FC<ProjectsListItemProps> = ({
  isAnchorForTourguide,
  className,
  dataTest,
  epoch,
  projectIpfsWithRewards,
  searchResultsLabel,
}) => {
  const { ipfsGateways } = env;
  const { address, isLoadingError, profileImageSmall, name, introDescription } =
    projectIpfsWithRewards;
  const navigate = useNavigate();
  const { data: userAllocations } = useUserAllocations(epoch);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { allocations, addAllocations, removeAllocations } = useAllocationsStore(state => ({
    addAllocations: state.addAllocations,
    allocations: state.data.allocations,
    removeAllocations: state.removeAllocations,
  }));
  const { data: currentEpoch } = useCurrentEpoch();
  const isAddedToAllocate = allocations!.includes(projectIpfsWithRewards.address);

  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    addAllocations,
    allocations,
    isDecisionWindowOpen,
    removeAllocations,
    userAllocationsElements: userAllocations?.elements,
  });

  const isAllocatedTo = useIsAllocatedTo(
    address,
    allocations,
    epoch!,
    isDecisionWindowOpen!,
    userAllocations,
  );
  const isEpoch1 = currentEpoch === 1;
  const isArchivedProject = epoch !== undefined;

  const isAddToAllocateButtonVisible = useIsAddToAllocateButtonVisible({
    isAllocatedTo,
    isArchivedProject,
  });

  return (
    <div
      className={cx(
        styles.root,
        className,
        !isLoadingError && styles.isClickable,
        isEpoch1 && styles.isEpoch1,
      )}
      data-address={address}
      data-epoch={epoch}
      data-test={dataTest}
      onClick={
        isLoadingError
          ? () => {}
          : () => {
              window[WINDOW_PROJECTS_SCROLL_Y] = window.scrollY;
              navigate(
                `${ROOT_ROUTES.project.absolute}/${
                  epoch ?? (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch)
                }/${address}`,
              );
            }
      }
    >
      {isLoadingError ? (
        <ProjectsListSkeletonItem />
      ) : (
        <Fragment>
          <div className={styles.header}>
            <div className={styles.imageProfileWrapper}>
              <Img
                className={styles.imageProfile}
                dataTest={
                  epoch
                    ? 'ProjectsListItem__imageProfile--archive'
                    : 'ProjectsListItem__imageProfile'
                }
                sources={ipfsGateways.split(',').map(element => `${element}${profileImageSmall}`)}
              />
              {searchResultsLabel && (
                <TinyLabel className={styles.tinyLabel} text={searchResultsLabel} />
              )}
            </div>
            {isAddToAllocateButtonVisible && (
              <ButtonAddToAllocate
                className={styles.button}
                dataTest={
                  epoch
                    ? 'ProjectsListItem__ButtonAddToAllocate--archive'
                    : 'ProjectsListItem__ButtonAddToAllocate'
                }
                id={isAnchorForTourguide ? TOURGUIDE_ELEMENT_7 : undefined}
                isAddedToAllocate={isAddedToAllocate}
                isAllocatedTo={isAllocatedTo}
                isArchivedProject={isArchivedProject}
                onClick={() => onAddRemoveFromAllocate(address)}
              />
            )}
          </div>
          <div className={styles.body}>
            <div
              className={styles.name}
              data-test={epoch ? 'ProjectsListItem__name--archive' : 'ProjectsListItem__name'}
            >
              {name}
            </div>
            <Description
              className={styles.introDescription}
              dataTest={
                epoch
                  ? 'ProjectsListItem__IntroDescription--archive'
                  : 'ProjectsListItem__IntroDescription'
              }
              text={introDescription!}
            />
          </div>
          {!isEpoch1 && (
            <Rewards
              address={address}
              className={styles.projectRewards}
              epoch={epoch}
              numberOfDonors={projectIpfsWithRewards.numberOfDonors}
              totalValueOfAllocations={projectIpfsWithRewards.totalValueOfAllocations}
              variant="projectsView"
            />
          )}
        </Fragment>
      )}
    </div>
  );
};

export default ProjectsListItem;
