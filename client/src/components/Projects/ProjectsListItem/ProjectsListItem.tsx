import cx from 'classnames';
import React, { FC, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import ProjectsListSkeletonItem from 'components/Projects/ProjectsListSkeletonItem/ProjectsListSkeletonItem';
import ButtonAddToAllocate from 'components/shared/ButtonAddToAllocate';
import RewardsWithoutThreshold from 'components/shared/RewardsWithoutThreshold';
import RewardsWithThreshold from 'components/shared/RewardsWithThreshold';
import Description from 'components/ui/Description';
import Img from 'components/ui/Img';
import { WINDOW_PROJECTS_SCROLL_Y } from 'constants/window';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';

import styles from './ProjectsListItem.module.scss';
import ProjectsListItemProps from './types';

const ProjectsListItem: FC<ProjectsListItemProps> = ({
  className,
  dataTest,
  epoch,
  projectIpfsWithRewards,
}) => {
  const { ipfsGateways } = env;
  const { address, isLoadingError, profileImageSmall, name, introDescription } =
    projectIpfsWithRewards;
  const navigate = useNavigate();
  const { data: userAllocations } = useUserAllocations(epoch);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();
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

  const isAllocatedTo = useMemo(() => {
    const isInUserAllocations = !!userAllocations?.elements.find(
      ({ address: userAllocationAddress }) => userAllocationAddress === address,
    );
    const isInAllocations = allocations.includes(address);
    if (epoch !== undefined) {
      return isInUserAllocations;
    }
    if (isDecisionWindowOpen) {
      return isInUserAllocations && isInAllocations;
    }
    return false;
  }, [address, allocations, userAllocations, epoch, isDecisionWindowOpen]);
  const isEpoch1 = currentEpoch === 1;
  const isArchivedProject = epoch !== undefined;

  const showAddToAllocateButton =
    !isProjectAdminMode &&
    !isPatronMode &&
    ((isAllocatedTo && isArchivedProject) || !isArchivedProject);

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
            <Img
              className={styles.imageProfile}
              dataTest={
                epoch ? 'ProjectsListItem__imageProfile--archive' : 'ProjectsListItem__imageProfile'
              }
              sources={ipfsGateways.split(',').map(element => `${element}${profileImageSmall}`)}
            />
            {showAddToAllocateButton && (
              <ButtonAddToAllocate
                className={styles.button}
                dataTest={
                  epoch
                    ? 'ProjectsListItem__ButtonAddToAllocate--archive'
                    : 'ProjectsListItem__ButtonAddToAllocate'
                }
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
          {!isEpoch1 && epoch && epoch < 4 && (
            <RewardsWithThreshold
              address={address}
              className={styles.projectRewards}
              epoch={epoch}
              numberOfDonors={projectIpfsWithRewards.numberOfDonors}
              totalValueOfAllocations={projectIpfsWithRewards.totalValueOfAllocations}
            />
          )}
          {!isEpoch1 && (!epoch || epoch >= 4) && (
            <RewardsWithoutThreshold
              className={styles.projectRewards}
              epoch={epoch}
              numberOfDonors={projectIpfsWithRewards.numberOfDonors}
              totalValueOfAllocations={projectIpfsWithRewards.totalValueOfAllocations}
            />
          )}
        </Fragment>
      )}
    </div>
  );
};

export default ProjectsListItem;
