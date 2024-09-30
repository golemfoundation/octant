import cx from 'classnames';
import _first from 'lodash/first';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import GridTile from 'components/shared/Grid/GridTile';
import Svg from 'components/ui/Svg';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useProjectsIpfsWithRewards, {
  ProjectIpfsWithRewards,
} from 'hooks/queries/useProjectsIpfsWithRewards';
import { arrowRight } from 'svg/misc';

import EpochResults from './EpochResults';
import styles from './HomeGridEpochResults.module.scss';
import HomeGridEpochResultsProps from './types';

const HomeGridEpochResults: FC<HomeGridEpochResultsProps> = ({ className }) => {
  const initalLoadingRef = useRef(true);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();
  const [epoch, setEpoch] = useState<number>(3);
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridEpochResults',
  });
  const { data: projectsIpfsWithRewards, isFetching: isFetchingProjectsIpfsWithRewards } =
    useProjectsIpfsWithRewards(epoch);
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  const projects = projectsIpfsWithRewards.reduce(
    (acc, curr) => {
      if (!curr.totalValueOfAllocations) {return acc;}
      acc.unshift({
        ...curr,
        epoch,
      });
      return acc;
    },
    [] as (ProjectIpfsWithRewards & { epoch: number })[],
  );

  const isAnyProjectDonated = projects.some(({ donations }) => donations > 0n);

  const isLoading = isFetchingProjectsIpfsWithRewards && !isAnyProjectDonated;

  const isRightArrowDisabled =
    (isLoading && initalLoadingRef.current) || epoch === currentEpoch! - 1;
  const isLeftArrowDisabled = (isLoading && initalLoadingRef.current) || epoch < 2;

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
      className={cx(
        styles.gridTile,
        className,
        isProjectAdminMode && styles.isProjectAdminMode,
        isPatronMode && styles.isPatronMode,
      )}
      title={t(isDecisionWindowOpen && epoch === currentEpoch! - 1 ? 'epochLive' : 'epochResults', {
        epoch,
      })}
      titleSuffix={
        <div className={styles.arrowsWrapper}>
          <div
            className={cx(styles.arrow, styles.leftArrow, isLeftArrowDisabled && styles.isDisabled)}
            onClick={() => {
              if (isLeftArrowDisabled) {
                return;
              }
              setEpoch(prev => prev - 1);
            }}
          >
            <Svg img={arrowRight} size={1.4} />
          </div>
          <div
            className={cx(styles.arrow, isRightArrowDisabled && styles.isDisabled)}
            onClick={() => {
              if (isRightArrowDisabled) {
                return;
              }
              setEpoch(prev => prev + 1);
            }}
          >
            <Svg img={arrowRight} size={1.4} />
          </div>
        </div>
      }
    >
      <div className={styles.root}>
        <EpochResults isLoading={isLoading} projects={projects} />
      </div>
    </GridTile>
  );
};

export default HomeGridEpochResults;
