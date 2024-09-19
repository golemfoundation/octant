import cx from 'classnames';
import _first from 'lodash/first';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import GridTile from 'components/shared/Grid/GridTile';
import Svg from 'components/ui/Svg';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import { arrowRight } from 'svg/misc';

import EpochResults from './EpochResults';
import styles from './HomeGridEpochResults.module.scss';
import HomeGridEpochResultsProps from './types';

const HomeGridEpochResults: FC<HomeGridEpochResultsProps> = ({ className }) => {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const [epoch, setEpoch] = useState<number>(currentEpoch! - 1);
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridEpochResults',
  });
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  const isRightArrowDisabled = epoch === currentEpoch! - 1;
  const isLeftArrowDisabled = epoch < 2;

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
        <EpochResults />
      </div>
    </GridTile>
  );
};

export default HomeGridEpochResults;
