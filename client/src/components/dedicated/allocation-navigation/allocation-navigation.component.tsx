import React, { FC } from 'react';

import Button from 'components/core/button/button.component';
import Loader from 'components/core/loader/loader.component';

import AllocationNavigationProps from './types';
import styles from './style.module.scss';

const AllocationNavigation: FC<AllocationNavigationProps> = ({
  areButtonsDisabled,
  onResetAllocationValues,
  onVote,
  isLoading,
  setCurrentView,
  currentView,
  isSummaryEnabled,
}) => {
  const buttonPreviousProps =
    currentView === 'edit'
      ? {
          label: 'Reset',
          onClick: onResetAllocationValues,
        }
      : {
          label: 'Edit',
          onClick: () => setCurrentView('edit'),
        };
  const buttonNextProps =
    currentView === 'edit'
      ? {
          label: 'Allocate',
          onClick: () => setCurrentView('summary'),
        }
      : {
          label: 'Confirm',
          onClick: onVote,
        };
  return (
    <div className={styles.root}>
      <Button className={styles.button} isDisabled={areButtonsDisabled} {...buttonPreviousProps} />
      <Button
        className={styles.button}
        Icon={isLoading && <Loader />}
        isDisabled={areButtonsDisabled || !isSummaryEnabled}
        isLoading={isLoading}
        variant="cta"
        {...buttonNextProps}
      />
    </div>
  );
};

export default AllocationNavigation;
