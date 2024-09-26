import cx from 'classnames';
import { maxBy } from 'lodash';
import React, { FC, useEffect, useState } from 'react';

import EpochResultsBar from 'components/Home/HomeGridEpochResults/EpochResultsBar';
import EpochResultsDetails from 'components/Home/HomeGridEpochResults/EpochResultsDetails';
import Img from 'components/ui/Img';
import { EPOCH_RESULTS_BAR_ID } from 'constants/domElementsIds';
import env from 'env';
import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

import styles from './EpochResults.module.scss';
import EpochResultsProps from './types';

const EpochResults: FC<EpochResultsProps> = ({ projects, isLoading }) => {
  const [highlightedBarAddress, setHighlightedBarAddress] = useState<null | string>(null);
  const { ipfsGateways } = env;

  const details = projects.find(d => d.address === highlightedBarAddress);

  const getMaxValue = (): bigint => {
    const { matchedRewards, donations } = maxBy(projects, d => {
      if (d.donations > d.matchedRewards) {
        return d.donations;
      }
      return d.matchedRewards;
    }) as ProjectIpfsWithRewards;
    return matchedRewards > donations ? matchedRewards : donations;
  };

  const getBarHeightPercentage = (value: bigint) => {
    const maxValue = getMaxValue();
    if (!maxValue || !value) {
      return 0;
    }
    return (Number(value) / Number(maxValue)) * 100;
  };

  useEffect(() => {
    if (!highlightedBarAddress) {
      return;
    }

    const listener = e => {
      if (
        e.target.id === EPOCH_RESULTS_BAR_ID ||
        e.target.parentElement.id === EPOCH_RESULTS_BAR_ID
      ) {
        return;
      }

      setHighlightedBarAddress(null);
    };

    document.addEventListener('click', listener);

    return () => document.removeEventListener('click', listener);
  }, [highlightedBarAddress]);

  return (
    <div className={styles.root}>
      <div className={cx(styles.graphContainer, isLoading && styles.isLoading)}>
        {isLoading ? (
          <Img className={styles.image} src="/images/headphones_girl.webp" />
        ) : (
          projects.map(({ address, matchedRewards, donations, profileImageSmall, epoch }) => (
            <EpochResultsBar
              key={`${address}__${epoch}`}
              address={address}
              bottomBarHeightPercentage={getBarHeightPercentage(donations)}
              imageSources={ipfsGateways
                .split(',')
                .map(element => `${element}${profileImageSmall}`)}
              isHighlighted={!!(highlightedBarAddress && highlightedBarAddress === address)}
              isLowlighted={!!(highlightedBarAddress && highlightedBarAddress !== address)}
              onClick={setHighlightedBarAddress}
              topBarHeightPercentage={getBarHeightPercentage(matchedRewards)}
            />
          ))
        )}
      </div>
      <EpochResultsDetails
        details={highlightedBarAddress ? details : undefined}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EpochResults;
