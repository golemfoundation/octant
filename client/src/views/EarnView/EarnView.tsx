import cx from 'classnames';
import React, { ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import EarnBoxGlmLock from 'components/Earn/EarnBoxGlmLock';
import EarnBoxPersonalAllocation from 'components/Earn/EarnBoxPersonalAllocation';
import EarnHistory from 'components/Earn/EarnHistory';
import EarnTipTiles from 'components/Earn/EarnTipTiles';
import Layout from 'components/shared/Layout';
import TimeCounter from 'components/shared/TimeCounter';
import BoxRounded from 'components/ui/BoxRounded';
import { PROJECT_ADMINS_ALLOWED_TO_LOCK_UNLOCK_GLMS } from 'constants/projectAdmins';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './EarnView.module.scss';

const EarnView = (): ReactElement => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.earn',
  });
  const { address } = useAccount();
  const [isPollingForCurrentEpoch, setIsPollingForCurrentEpoch] = useState<boolean>(false);
  const { data: currentEpoch } = useCurrentEpoch({
    refetchInterval: isPollingForCurrentEpoch ? 5000 : false,
  });

  const isProjectAdminMode = useIsProjectAdminMode();

  useEffect(() => {
    // When Epoch 0 ends, we poll for Epoch 1 from the backend.
    if (isPollingForCurrentEpoch && currentEpoch === 1) {
      setIsPollingForCurrentEpoch(false);
    }
  }, [isPollingForCurrentEpoch, currentEpoch, setIsPollingForCurrentEpoch]);

  const isPreLaunch = getIsPreLaunch(currentEpoch);

  const preLaunchStartTimestamp = Date.UTC(2023, 7, 4, 10, 0, 0, 0); // 04.08.2023 12:00 CEST
  const preLaunchEndTimestamp = Date.UTC(2023, 7, 8, 16, 0, 0, 0); // 08.08.2023 18:00 CEST
  const duration = preLaunchEndTimestamp - preLaunchStartTimestamp;

  const isProjectAdminAllowedToLockUnlock =
    address && PROJECT_ADMINS_ALLOWED_TO_LOCK_UNLOCK_GLMS.includes(address);

  return (
    <Layout dataTest="EarnView">
      <EarnTipTiles />
      <div className={styles.wrapper}>
        <div className={cx(styles.boxesWrapper, styles.column)}>
          {isPreLaunch && (
            <BoxRounded className={styles.box} isVertical title={t('preLaunch.timerTitle')}>
              <TimeCounter
                className={styles.preLaunchTimer}
                duration={duration}
                onCountingFinish={() => setIsPollingForCurrentEpoch(true)}
                timestamp={preLaunchEndTimestamp}
              />
            </BoxRounded>
          )}
          {(!isProjectAdminMode || isProjectAdminAllowedToLockUnlock) && (
            <EarnBoxGlmLock classNameBox={styles.box} />
          )}
          <EarnBoxPersonalAllocation className={styles.box} />
        </div>
        <EarnHistory className={styles.column} />
      </div>
    </Layout>
  );
};

export default EarnView;
