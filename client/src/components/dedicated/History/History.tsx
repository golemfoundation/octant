import cx from 'classnames';
import { formatUnits } from 'ethers/lib/utils';
import React, { Fragment, ReactElement } from 'react';
import { useMetamask } from 'use-metamask';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Loader from 'components/core/Loader/Loader';
import Svg from 'components/core/Svg/Svg';
import useAllocations from 'hooks/subgraph/useAllocations';
import useLocks from 'hooks/subgraph/useLocks';
import useUnlocks from 'hooks/subgraph/useUnlocks';
import useEpochAndAllocationTimestamps from 'hooks/useEpochAndAllocationTimestamps';
import { allocate, donation } from 'svg/history';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './History.module.scss';
import { sortAllocationsAndLocks } from './utils';

const History = (): ReactElement => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const { data: dataAllocations } = useAllocations();
  const { data: dataLocks } = useLocks();
  const { data: dataUnlocks } = useUnlocks();
  const { timeCurrentEpochStart } = useEpochAndAllocationTimestamps();

  let allocationsAndDeposits =
    dataLocks !== undefined && dataAllocations !== undefined && dataUnlocks !== undefined
      ? [...dataLocks, ...dataAllocations, ...dataUnlocks]
      : undefined;
  allocationsAndDeposits = allocationsAndDeposits
    ? sortAllocationsAndLocks(allocationsAndDeposits)
    : undefined;

  const isListAvailable = (isConnected && allocationsAndDeposits !== undefined) || !isConnected;

  return (
    <div className={styles.root}>
      <div className={styles.header}>History</div>
      {!isListAvailable || timeCurrentEpochStart === undefined ? (
        <Loader className={styles.loader} />
      ) : (
        allocationsAndDeposits?.map((element, index) => (
          <BoxRounded
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={cx(
              styles.box,
              element.blockTimestamp < timeCurrentEpochStart && styles.isPast,
            )}
          >
            {(() => {
              if (element.type === 'Allocated') {
                return (
                  <Fragment>
                    <div className={styles.iconAndTitle}>
                      <Svg img={allocate} size={4} />
                      <div className={styles.titleAndSubtitle}>
                        <div className={styles.title}>Allocated funds</div>
                        <div className={styles.subtitle}>{element.array.length} Projects</div>
                      </div>
                    </div>
                    <div>{getFormattedEthValue(element.amount).fullString}</div>
                  </Fragment>
                );
              }

              return (
                <Fragment>
                  <div className={styles.iconAndTitle}>
                    <Svg img={donation} size={4} />
                    <div className={styles.titleAndSubtitle}>
                      <div className={styles.title}>
                        {element.type === 'Withdrawn' ? `Unlocked GLM` : `Locked GLM`}
                      </div>
                    </div>
                  </div>
                  <div>{formatUnits(element.amount)} GLM</div>
                </Fragment>
              );
            })()}
          </BoxRounded>
        ))
      )}
    </div>
  );
};

export default History;
