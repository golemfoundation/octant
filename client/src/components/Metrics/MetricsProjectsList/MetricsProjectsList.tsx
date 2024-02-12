import React, { FC } from 'react';

import MetricsProjectsListItem from 'components/Metrics/MetricsProjectsListItem';
import MetricsProjectsListSkeletonItem from 'components/Metrics/MetricsProjectsListSkeletonItem';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './MetricsProjectsList.module.scss';
import MetricsProjectsListProps from './types';

const MetricsProjectsList: FC<MetricsProjectsListProps> = ({
  projects,
  isLoading,
  numberOfSkeletons,
}) => {
  return (
    <div className={styles.root}>
      <div className={styles.projectsList}>
        {isLoading
          ? Array.from(Array(numberOfSkeletons)).map((_, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <MetricsProjectsListSkeletonItem key={`skeleton-${idx}`} />
            ))
          : projects.map(project => (
              <MetricsProjectsListItem
                key={project.address}
                address={project.address}
                epoch={project.epoch}
                value={getFormattedEthValue(project.value, true, true, true).value}
              />
            ))}
      </div>
    </div>
  );
};

export default MetricsProjectsList;
