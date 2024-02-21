import React, { FC, memo } from 'react';

import env from 'env';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';

import styles from './MetricsProjectsListItem.module.scss';
import MetricsProjectsListItemProps from './types';

const MetricsProjectsListItem: FC<MetricsProjectsListItemProps> = ({ address, epoch, value }) => {
  const { ipfsGateway } = env;
  const { data: proposalsIpfs } = useProposalsIpfs([address], epoch);

  const image = proposalsIpfs.at(0)?.profileImageSmall;
  const name = proposalsIpfs.at(0)?.name;

  return (
    <div className={styles.root}>
      <img alt="project logo" className={styles.image} src={`${ipfsGateway}${image}`} />
      <div className={styles.name}>{name}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
};

export default memo(MetricsProjectsListItem);
