import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';

import styles from './AllocationNavigation.module.scss';
import AllocationNavigationProps from './types';

const AllocationNavigation: FC<AllocationNavigationProps> = ({
  isLoading,
  onAllocate,
  onResetValues,
  onEdit,
  isLocked,
  isLeftButtonDisabled,
  isRightButtonDisabled,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationNavigation',
  });

  return (
    <div className={styles.root}>
      <Button
        className={styles.button}
        isDisabled={isLeftButtonDisabled}
        label={t('reset')}
        onClick={onResetValues}
      />
      <Button
        className={styles.button}
        isDisabled={isRightButtonDisabled}
        isLoading={isLoading}
        label={isLocked ? t('edit') : t('confirm')}
        onClick={isLocked ? onEdit : onAllocate}
        variant="cta"
      />
    </div>
  );
};

export default AllocationNavigation;
