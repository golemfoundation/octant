import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import GridTile from 'components/shared/Grid/GridTile';
import { TOURGUIDE_ELEMENT_6 } from 'constants/domElementsIds';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProjectsIpfsWithRewards, {
  ProjectIpfsWithRewards,
} from 'hooks/queries/useProjectsIpfsWithRewards';

import EpochResults from './EpochResults';
import styles from './HomeGridEpochResults.module.scss';
import HomeGridEpochResultsProps from './types';

const HomeGridEpochResults: FC<HomeGridEpochResultsProps> = ({ className }) => {
  const initalLoadingRef = useRef(true);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();
  const [epoch, setEpoch] = useState<number>(currentEpoch! - 1);
  const [highlightedBarAddress, setHighlightedBarAddress] = useState<null | string>(null);
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridEpochResults',
  });
  const { data: projectsIpfsWithRewards, isFetching: isFetchingProjectsIpfsWithRewards } =
    useProjectsIpfsWithRewards(
      isDecisionWindowOpen && epoch === currentEpoch! - 1 ? undefined : epoch,
    );
  const projects = projectsIpfsWithRewards.reduce((acc, curr, idx) => {
    if (!curr.totalValueOfAllocations) {
      return acc;
    }
    acc[idx % 2 === 0 ? 'push' : 'unshift'](curr);
    return acc;
  }, [] as ProjectIpfsWithRewards[]);

  const isAnyProjectDonated = projects.some(({ donations }) => donations > 0n);

  const isLoading = isFetchingProjectsIpfsWithRewards && !isAnyProjectDonated;

  useEffect(() => {
    if (!isDecisionWindowOpen || isLoading || epoch !== currentEpoch! - 1 || isAnyProjectDonated) {
      return;
    }

    setEpoch(prev => prev - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    if ((initalLoadingRef.current && isLoading) || !initalLoadingRef.current) {
      return;
    }

    initalLoadingRef.current = false;
  }, [isLoading]);

  return (
    <GridTile
      className={className}
      dataTest="HomeGridEpochResults"
      id={TOURGUIDE_ELEMENT_6}
      onMouseLeave={() => setHighlightedBarAddress(null)}
      title={t(isDecisionWindowOpen && epoch === currentEpoch! - 1 ? 'epochLive' : 'epochResults', {
        epoch,
      })}
    >
      <div className={styles.root}>
        <EpochResults
          epoch={epoch}
          highlightedBarAddress={highlightedBarAddress}
          isLoading={isLoading}
          projects={projects}
          setHighlightedBarAddress={setHighlightedBarAddress}
        />
      </div>
    </GridTile>
  );
};

export default HomeGridEpochResults;
