import React, { FC, Fragment } from 'react';

import Img from 'components/ui/Img';
import env from 'env';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import useSettingsStore from 'store/settings/store';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';

import styles from './ProjectAllocationDetailRow.module.scss';
import ProjectAllocationDetailRowProps from './types';

const ProjectAllocationDetailRow: FC<ProjectAllocationDetailRowProps> = ({
  address,
  amount,
  epoch,
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
  const { data: proposalIpfs, isFetching: isFetchingProposalIpfs } = useProposalsIpfs(
    [address],
    epoch,
  );
  return (
    <div className={styles.root}>
      {isFetchingProposalIpfs ? (
        <div className={styles.skeleton} />
      ) : (
        <Fragment>
          <div className={styles.imageAndName}>
            <Img
              className={styles.image}
              sources={ipfsGateways
                .split(',')
                .map(element => `${element}${proposalIpfs[0].profileImageSmall!}`)}
            />
            <div className={styles.name}>{proposalIpfs[0].name}</div>
          </div>
          <div className={styles.amount}>
            {isCryptoMainValueDisplay
              ? getValueCryptoToDisplay({
                  cryptoCurrency: 'ethereum',
                  shouldIgnoreGwei: true,
                  valueCrypto: amount,
                })
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
