import cx from 'classnames';
import React, { ChangeEvent, FC, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ProjectsListItem from 'components/Projects/ProjectsListItem';
import ProjectsListSkeletonItem from 'components/Projects/ProjectsListSkeletonItem';
import InputText from 'components/ui/InputText/InputText';
import Svg from 'components/ui/Svg';
import { PROJECTS_ADDRESSES_RANDOMIZED_ORDER } from 'constants/localStorageKeys';
import useEpochDurationLabel from 'hooks/helpers/useEpochDurationLabel';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProjectsEpoch from 'hooks/queries/useProjectsEpoch';
import useProjectsIpfsWithRewards from 'hooks/queries/useProjectsIpfsWithRewards';
import { magnifyingGlass } from 'svg/misc';
import { ProjectsAddressesRandomizedOrder } from 'types/localStorage';

import styles from './ProjectsList.module.scss';
import ProjectsListProps from './types';

const ProjectsList: FC<ProjectsListProps> = ({
  areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
  epoch,
  isFirstArchive,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.projectsList',
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: projectsEpoch, isFetching: isFetchingProjectsEpoch } = useProjectsEpoch(epoch);
  const { data: projectsIpfsWithRewards, isFetching: isFetchingProjectsWithRewards } =
    useProjectsIpfsWithRewards(epoch);
  const epochDurationLabel = useEpochDurationLabel(epoch);

  const isLoading = isFetchingProjectsEpoch || isFetchingProjectsWithRewards;

  const isLatestEpochAndDecisionWindowOpen = epoch === undefined && !!isDecisionWindowOpen;

  const onChangeSearchQuery = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const areProjectsIpfsWithRewardsAvailable =
    projectsIpfsWithRewards.length > 0 && !isFetchingProjectsWithRewards;
  const projectsIpfsWithRewardsFiltered = areProjectsIpfsWithRewardsAvailable
    ? projectsIpfsWithRewards.filter(projectIpfsWithRewards => {
        return (
          projectIpfsWithRewards.name!.toLowerCase().includes(searchQuery.toLowerCase()) ||
          projectIpfsWithRewards.address!.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : [];

  const projectsAddressesRandomizedOrder = JSON.parse(
    localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER)!,
  ) as ProjectsAddressesRandomizedOrder;

  const projectsAddressesToIterate = isLatestEpochAndDecisionWindowOpen
    ? projectsAddressesRandomizedOrder.addressesRandomizedOrder
    : projectsIpfsWithRewards.map(({ address }) => address);

  return (
    <div
      className={styles.list}
      data-isloading={isLoading ? 'true' : 'false'}
      data-test={epoch ? 'ProjectsView__ProjectsList--archive' : 'ProjectsView__ProjectsList'}
    >
      {epoch && (
        <>
          {areCurrentEpochsProjectsHiddenOutsideAllocationWindow && isFirstArchive ? null : (
            <div className={styles.divider} />
          )}
          <div
            className={styles.epochArchive}
            data-test="ProjectsView__ProjectsList__header--archive"
          >
            {t('epochArchive', { epoch })}
            <span
              className={cx(
                styles.epochDurationLabel,
                epochDurationLabel === '' && styles.isFetching,
              )}
            >
              {epochDurationLabel}
            </span>
          </div>
        </>
      )}
      {isLatestEpochAndDecisionWindowOpen && (
        <InputText
          className={styles.inputSearch}
          Icon={<Svg img={magnifyingGlass} size={3.2} />}
          onChange={onChangeSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder={t('searchInputPlaceholder')}
          value={searchQuery}
          variant="search"
        />
      )}
      {areProjectsIpfsWithRewardsAvailable
        ? projectsAddressesToIterate.map((address, index) => {
            const projectIpfsWithRewards = projectsIpfsWithRewardsFiltered.find(
              element => element.address === address,
            );

            if (!projectIpfsWithRewards) {
              return null;
            }

            return (
              <ProjectsListItem
                key={projectIpfsWithRewards.address}
                className={styles.element}
                dataTest={
                  epoch
                    ? `ProjectsView__ProjectsListItem--archive--${index}`
                    : `ProjectsView__ProjectsListItem--${index}`
                }
                epoch={epoch}
                projectIpfsWithRewards={projectIpfsWithRewards}
              />
            );
          })
        : projectsEpoch?.projectsAddresses?.map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ProjectsListSkeletonItem key={index} className={styles.element} />
          ))}
    </div>
  );
};

export default memo(ProjectsList);
