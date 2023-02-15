import cx from 'classnames';
import { formatUnits } from 'ethers/lib/utils';
import React, { Fragment, ReactElement } from 'react';
import { useMetamask } from 'use-metamask';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Loader from 'components/core/Loader/Loader';
import Svg from 'components/core/Svg/Svg';
import useAllocations from 'hooks/subgraph/useAllocations';
import useDeposits from 'hooks/subgraph/useDeposits';
import useWithdrawns from 'hooks/subgraph/useWithdrawns';
import useEpochAndAllocationTimestamps from 'hooks/useEpochAndAllocationTimestamps';
import { allocate, donation } from 'svg/history';
import getFormattedUnits from 'utils/getFormattedUnit';

import styles from './History.module.scss';
import { sortAllocationsAndDeposits } from './utils';

const History = (): ReactElement => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const { data: dataDeposits } = useDeposits();
  const { data: dataAllocations } = useAllocations();
  const { data: dataWithdrawns } = useWithdrawns();
  const { timeCurrentEpochStart } = useEpochAndAllocationTimestamps();

  let allocationsAndDeposits =
    dataDeposits !== undefined && dataAllocations !== undefined && dataWithdrawns !== undefined
      ? [...dataDeposits, ...dataAllocations, ...dataWithdrawns]
      : undefined;
  allocationsAndDeposits = allocationsAndDeposits
    ? sortAllocationsAndDeposits(allocationsAndDeposits)
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
                    <div>{getFormattedUnits(element.amount)}</div>
                  </Fragment>
                );
              }

              return (
                <Fragment>
                  <div className={styles.iconAndTitle}>
                    <Svg img={donation} size={4} />
                    <div className={styles.titleAndSubtitle}>
                      <div className={styles.title}>
                        {element.type === 'Withdrawn' ? `Unstaked GLM` : `Staked GLM`}
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
