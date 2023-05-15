import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/core/Button/Button';

import styles from './AllocationNavigation.module.scss';
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
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationNavigation',
  });

  const buttonPreviousProps =
    currentView === 'edit'
      ? {
          label: t('reset'),
          onClick: onResetAllocationValues,
        }
      : {
          label: t('edit'),
          onClick: () => setCurrentView('edit'),
        };
  const buttonNextProps =
    currentView === 'edit'
      ? {
          label: t('allocate'),
          onClick: () => setCurrentView('summary'),
        }
      : {
          label: t('confirm'),
          onClick: onAllocate,
        };
  return (
    <div className={styles.root}>
      <Button className={styles.button} isDisabled={areButtonsDisabled} {...buttonPreviousProps} />
      <Button
        className={styles.button}
        isDisabled={areButtonsDisabled || !isSummaryEnabled}
        isLoading={isLoading}
        variant="cta"
        {...buttonNextProps}
      />
    </div>
  );
};

export default AllocationNavigation;
