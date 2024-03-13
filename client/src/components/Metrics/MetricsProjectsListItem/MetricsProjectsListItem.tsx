import React, { FC, memo } from 'react';

import Img from 'components/ui/Img/Img';
import env from 'env';
import useProjectsIpfs from 'hooks/queries/useProjectsIpfs';

import styles from './MetricsProjectsListItem.module.scss';
import MetricsProjectsListItemProps from './types';

const MetricsProjectsListItem: FC<MetricsProjectsListItemProps> = ({ address, epoch, value }) => {
  const { ipfsGateways } = env;
  const { data: projectsIpfs } = useProjectsIpfs([address], epoch);

  const image = projectsIpfs.at(0)?.profileImageSmall;
  const name = projectsIpfs.at(0)?.name;

  return (
    <div className={styles.root}>
      <Img
        alt="project logo"
        className={styles.image}
        sources={ipfsGateways.split(',').map(element => `${element}${image}`)}
      />
      <div className={styles.name}>{name}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
};

export default memo(MetricsProjectsListItem);
