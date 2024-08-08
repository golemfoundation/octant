import React, { FC, Fragment } from 'react';

import Img from 'components/ui/Img';
import env from 'env';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useProjectsIpfs from 'hooks/queries/useProjectsIpfs';

import styles from './ProjectAllocationDetailRow.module.scss';
import ProjectAllocationDetailRowProps from './types';

const ProjectAllocationDetailRow: FC<ProjectAllocationDetailRowProps> = ({
  address,
  amount,
  epoch,
  isLoading,
}) => {
  const { ipfsGateways } = env;
  const {
    data: projectIpfs,
    isFetching: isFetchingProjectIpfs,
    isAnyIpfsError,
  } = useProjectsIpfs([address], epoch, !isLoading);

  const getValuesToDisplay = useGetValuesToDisplay();

  return (
    <div className={styles.root}>
      {isLoading || isFetchingProjectIpfs || isAnyIpfsError ? (
        <div className={styles.skeleton} />
      ) : (
        <Fragment>
          <div className={styles.imageAndName}>
            <Img
              className={styles.image}
              sources={ipfsGateways
                .split(',')
                .map(element => `${element}${projectIpfs[0].profileImageSmall!}`)}
            />
            <div className={styles.name}>{projectIpfs[0].name}</div>
          </div>
          <div className={styles.amount}>
            {
              getValuesToDisplay({
                cryptoCurrency: 'ethereum',
                getFormattedEthValueProps: {
                  shouldIgnoreGwei: true,
                },
                showCryptoSuffix: true,
                valueCrypto: amount,
              }).primary
            }
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default ProjectAllocationDetailRow;
