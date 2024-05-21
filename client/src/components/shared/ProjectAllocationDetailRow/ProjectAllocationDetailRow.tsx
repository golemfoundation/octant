import React, { FC, Fragment } from 'react';

import Img from 'components/ui/Img';
import env from 'env';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useProjectsIpfs from 'hooks/queries/useProjectsIpfs';
import useSettingsStore from 'store/settings/store';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';

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
    data: { displayCurrency, isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);
  const { data: projectIpfs, isFetching: isFetchingProjectIpfs } = useProjectsIpfs(
    [address],
    epoch,
    !isLoading,
  );

  return (
    <div className={styles.root}>
      {isLoading || isFetchingProjectIpfs ? (
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
            {isCryptoMainValueDisplay
              ? getValueCryptoToDisplay({
                  cryptoCurrency: 'ethereum',
                  getFormattedEthValueProps: {
                    shouldIgnoreGwei: true,
                  },
                  valueCrypto: amount,
                }).fullString
              : getValueFiatToDisplay({
                  cryptoCurrency: 'ethereum',
                  cryptoValues,
                  displayCurrency: displayCurrency!,
                  error,
                  valueCrypto: amount,
                })}
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default ProjectAllocationDetailRow;
