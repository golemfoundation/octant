import cx from 'classnames';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import BoxGlmLock from 'components/dedicated/BoxGlmLock/BoxGlmLock';
import BoxPersonalAllocation from 'components/dedicated/BoxPersonalAllocation/BoxPersonalAllocation';
import History from 'components/dedicated/History/History';
import TimeCounter from 'components/dedicated/TimeCounter/TimeCounter';
import TipTile from 'components/dedicated/TipTile/TipTile';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useWithdrawableUserEth from 'hooks/queries/useWithdrawableUserEth';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useTipsStore from 'store/tips/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './EarnView.module.scss';

const EarnView = (): ReactElement => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'views.earn',
  });
  const { data: withdrawableUserEth } = useWithdrawableUserEth();
  const { wasWithdrawAlreadyClosed, setWasWithdrawAlreadyClosed } = useTipsStore(state => ({
    setWasWithdrawAlreadyClosed: state.setWasWithdrawAlreadyClosed,
    wasWithdrawAlreadyClosed: state.data.wasWithdrawAlreadyClosed,
  }));
  const { data: currentEpoch } = useCurrentEpoch();

  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isWithdrawTipVisible =
    !!currentEpoch &&
    currentEpoch > 1 &&
    !!withdrawableUserEth &&
    !withdrawableUserEth.isZero() &&
    !wasWithdrawAlreadyClosed;

  const preLaunchEndTimestamp = Date.UTC(2023, 7, 1, 0, 0, 0);
  // TODO OCT-668: set preLaunchStartTimestamp -> https://linear.app/golemfoundation/issue/OCT-668/set-prelaunchstarttimestamp-before-deploy-on-production
  const preLaunchStartTimestamp = Date.UTC(2023, 6, 1, 0, 0, 0);
  const duration = preLaunchEndTimestamp - preLaunchStartTimestamp;

  return (
    <MainLayout classNameBody={styles.layoutBody} dataTest="EarnView">
      <TipTile
        className={styles.tip}
        image="images/tip-withdraw.webp"
        infoLabel={i18n.t('common.gettingStarted')}
        isOpen={isWithdrawTipVisible}
        onClose={() => setWasWithdrawAlreadyClosed(true)}
        text={t('tip.text')}
        title={t('tip.title')}
      />
      <div className={styles.wrapper}>
        <div className={cx(styles.boxesWrapper, styles.column)}>
          {isPreLaunch && (
            <BoxRounded className={styles.box} isVertical title={t('preLaunch.timerTitle')}>
              <TimeCounter
                className={styles.preLaunchTimer}
                duration={duration}
                timestamp={preLaunchEndTimestamp}
              />
            </BoxRounded>
          )}
          <BoxGlmLock classNameBox={styles.box} />
          <BoxPersonalAllocation className={styles.box} />
        </div>
        <History className={styles.column} />
      </div>
    </MainLayout>
  );
};

export default EarnView;
