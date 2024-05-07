import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';

import styles from './AllocationNavigation.module.scss';
import AllocationNavigationProps from './types';

const AllocationNavigation: FC<AllocationNavigationProps> = ({
  isLeftButtonDisabled,
  areButtonsDisabled,
  currentView,
  isLoading,
  onAllocate,
  onResetValues,
  setCurrentView,
  isWaitingForAllMultisigSignatures,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationNavigation',
  });

  const commonProps = {
    isDisabled: areButtonsDisabled,
  };
  const buttonPreviousProps = {
    isDisabled: isLeftButtonDisabled,
    label: t('reset'),
    onClick: onResetValues,
  };
  const buttonNextProps =
    isWaitingForAllMultisigSignatures || currentView === 'edit'
      ? {
          label: isWaitingForAllMultisigSignatures ? t('waiting') : t('confirm'),
          onClick: onAllocate,
        }
      : {
          label: t('edit'),
          onClick: () => setCurrentView('edit'),
        };

  return (
    <div className={styles.root}>
      <Button className={styles.button} {...commonProps} {...buttonPreviousProps} />
      <Button
        className={styles.button}
        isLoading={isLoading}
        variant="cta"
        {...commonProps}
        {...buttonNextProps}
      />
    </div>
  );
};

export default AllocationNavigation;
