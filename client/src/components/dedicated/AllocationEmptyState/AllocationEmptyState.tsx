import React, { ReactElement, useMemo } from 'react';
import { Trans } from 'react-i18next';

import Img from 'components/core/Img/Img';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

import styles from './AllocationEmptyState.module.scss';

const AllocationEmptyState = (): ReactElement => {
  const { data: currentEpoch } = useCurrentEpoch();
  const { isDesktop } = useMediaQuery();

  const i18nKeyPrefix = 'components.dedicated.allocationEmptyState';

  const textI18nKey = useMemo(() => {
    if (currentEpoch === 1) {
      if (isDesktop) {
        return `${i18nKeyPrefix}.epoch1textDesktop`;
      }

      return `${i18nKeyPrefix}.epoch1textMobile`;
    }

    return `${i18nKeyPrefix}.text`;
  }, [currentEpoch, isDesktop]);

  return (
    <div className={styles.root}>
      <Img className={styles.image} src="images/rewards.webp" />
      <div className={styles.text}>
        <Trans i18nKey={textI18nKey} />
      </div>
    </div>
  );
};

export default AllocationEmptyState;
