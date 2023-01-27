import React, { FC } from 'react';

import Button from 'components/core/Button/Button';
import Loader from 'components/core/Loader/Loader';

import styles from './style.module.scss';
import AllocationNavigationProps from './types';

const AllocationNavigation: FC<AllocationNavigationProps> = ({
  areButtonsDisabled,
  onResetAllocationValues,
  onAllocate,
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
          onClick: onAllocate,
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
