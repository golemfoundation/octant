import { maxBy } from 'lodash';
import React, { FC, useEffect, useState } from 'react';

import EpochResultsBar from 'components/Home/HomeGridEpochResults/EpochResultsBar';
import EpochResultsDetails from 'components/Home/HomeGridEpochResults/EpochResultsDetails';
import { EPOCH_RESULTS_BAR_ID } from 'constants/domElementsIds';
import env from 'env';
import useProjectsIpfsWithRewards, {
  ProjectIpfsWithRewards,
} from 'hooks/queries/useProjectsIpfsWithRewards';

import styles from './EpochResults.module.scss';

const EpochResults: FC<{ epoch: number }> = ({ epoch }) => {
  const { data: projectsIpfsWithRewards } = useProjectsIpfsWithRewards();
  const [highlightedBarAddress, setHighlightedBarAddress] = useState<null | string>(null);
  const { ipfsGateways } = env;

  const projects =
    projectsIpfsWithRewards.map(props => ({
      epoch,
      ...props,
    })) || [];

  const details = projects.find(d => d.address === highlightedBarAddress);

  const getMaxValue = (): bigint => {
    const { matchingFund, donations } = maxBy(projects, d => {
      if (d.donations > d.matchingFund) {
        return d.donations;
      }
      return d.matchingFund;
    }) as ProjectIpfsWithRewards;
    return matchingFund > donations ? matchingFund : donations;
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
      <div className={styles.graphContainer}>
        {projects.map(({ address, matchingFund, donations, profileImageSmall }) => (
          <EpochResultsBar
            key={`${address}__${epoch}`}
            address={address}
            bottomBarHeightPercentage={getBarHeightPercentage(donations)}
            imageSources={ipfsGateways.split(',').map(element => `${element}${profileImageSmall}`)}
            isHighlighted={!!(highlightedBarAddress && highlightedBarAddress === address)}
            isLowlighted={!!(highlightedBarAddress && highlightedBarAddress !== address)}
            onClick={setHighlightedBarAddress}
            topBarHeightPercentage={getBarHeightPercentage(matchingFund)}
          />
        ))}
      </div>
      <EpochResultsDetails details={highlightedBarAddress ? details : undefined} />
    </div>
  );
};

export default EpochResults;
