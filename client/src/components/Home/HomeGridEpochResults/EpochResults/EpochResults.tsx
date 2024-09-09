import { maxBy } from 'lodash';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import EpochResultsBar from 'components/Home/HomeGridEpochResults/EpochResultsBar';
import EpochResultsDetails from 'components/Home/HomeGridEpochResults/EpochResultsDetails';
import { EPOCH_RESULTS_BAR_ID } from 'constants/domElementsIds';

import styles from './EpochResults.module.scss';

// TODO: replace with real data -> https://linear.app/golemfoundation/issue/OCT-1931/home-epoch-results-live-connect-with-be
const data = [
  {
    address: '0x576edCed7475D8F64a5e2D5227c93Ca57d7f5d20',
    donations: 10n,
    matching: 100n,
  },
  {
    address: '0x53390590476dC98860316e4B46Bb9842AF55efc4',
    donations: 15n,
    matching: 250n,
  },
  {
    address: '0x9531C059098e3d194fF87FebB587aB07B30B1306',
    donations: 40n,
    matching: 100n,
  },
];

const EpochResults = (): ReactNode => {
  const [highlightedBarAddress, setHighlightedBarAddress] = useState<null | string>(null);

  const details = useMemo(() => {
    const projectData = data.find(d => d.address === highlightedBarAddress);
    return projectData;
  }, [highlightedBarAddress]);

  const getMaxValue = (): bigint => {
    const { matching, donations } = maxBy(data, d => {
      if (d.donations > d.matching) {
        return d.donations;
      }
      return d.matching;
    }) as any;
    return matching > donations ? matching : donations;
  };

  const getBarHeightPercentage = (value: bigint) => {
    return (Number(value) / Number(getMaxValue())) * 100;
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
        {data.map(({ address, matching, donations }) => (
          <EpochResultsBar
            key={address}
            address={address}
            bottomBarHeightPercentage={getBarHeightPercentage(donations)}
            isHighlighted={!!(highlightedBarAddress && highlightedBarAddress === address)}
            isLowlighted={!!(highlightedBarAddress && highlightedBarAddress !== address)}
            onClick={setHighlightedBarAddress}
            topBarHeightPercentage={getBarHeightPercentage(matching)}
          />
        ))}
      </div>
      <EpochResultsDetails details={highlightedBarAddress ? details : null} />
    </div>
  );
};

export default EpochResults;
