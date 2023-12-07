import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';

import styles from './AllocationNavigation.module.scss';
import AllocationNavigationProps from './types';

const AllocationNavigation: FC<AllocationNavigationProps> = ({
  areButtonsDisabled,
  currentView,
  isLoading,
  isPrevResetButtonEnabled = true,
  onAllocate,
  onResetValues,
  setCurrentView,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationNavigation',
  });

  const buttonPreviousProps =
    currentView === 'edit'
      ? {
          label: t('reset'),
          onClick: onResetValues,
        }
      : {
          label: t('back'),
          onClick: () => setCurrentView('edit'),
        };
  const buttonNextProps =
    currentView === 'edit'
      ? {
          label: t('next'),
          onClick: () => setCurrentView('summary'),
        }
      : {
          label: t('confirm'),
          onClick: onAllocate,
        };

  const isPrevResetButtonDisabled = useMemo(() => {
    if (isPrevResetButtonEnabled) {
      return false;
    }
    return areButtonsDisabled || isLoading;
  }, [isPrevResetButtonEnabled, areButtonsDisabled, isLoading]);

  return (
    <div className={styles.root}>
      <Button
        className={styles.button}
        isDisabled={isPrevResetButtonDisabled}
        {...buttonPreviousProps}
      />
      <Button
        className={styles.button}
        isDisabled={areButtonsDisabled}
        isLoading={isLoading}
        variant="cta"
        {...buttonNextProps}
      />
    </div>
  );
};

export default AllocationNavigation;
