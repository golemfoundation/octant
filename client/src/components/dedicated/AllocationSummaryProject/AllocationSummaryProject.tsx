import React, { FC } from 'react';

import Img from 'components/core/Img/Img';
import env from 'env';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';

import styles from './AllocationSummaryProject.module.scss';
import AllocationSummaryProjectProps from './types';

const AllocationSummaryProject: FC<AllocationSummaryProjectProps> = ({ address, value }) => {
  const { ipfsGateway } = env;

  const { data: proposalsIpfs } = useProposalsIpfs([address]);
  const proposal = proposalsIpfs[0] || {};
  const { profileImageCID, name } = proposal;

  const ethValue = getValueCryptoToDisplay({ cryptoCurrency: 'ethereum', valueCrypto: value });

  return (
    <div className={styles.root}>
      <div className={styles.info}>
        <Img className={styles.logo} src={`${ipfsGateway}${profileImageCID}`} />
        {name}
      </div>
      <div className={styles.allocation}>{ethValue}</div>
    </div>
  );
};

export default AllocationSummaryProject;
