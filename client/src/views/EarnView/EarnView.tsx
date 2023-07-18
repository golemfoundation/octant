import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import BoxGlmLock from 'components/dedicated/BoxGlmLock/BoxGlmLock';
import BoxWithdrawEth from 'components/dedicated/BoxWithdrawEth/BoxWithdrawEth';
import History from 'components/dedicated/History/History';
import TipTile from 'components/dedicated/TipTile/TipTile';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useWithdrawableUserEth from 'hooks/queries/useWithdrawableUserEth';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useTipsStore from 'store/tips/store';

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

  const isWithdrawTipVisible =
    !!currentEpoch &&
    currentEpoch > 1 &&
    !!withdrawableUserEth &&
    !withdrawableUserEth.isZero() &&
    !wasWithdrawAlreadyClosed;

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
        <div className={styles.boxesWrapper}>
          <BoxGlmLock classNameBox={styles.box} />
          <BoxWithdrawEth classNameBox={styles.box} />
        </div>
        <History />
      </div>
    </MainLayout>
  );
};

export default EarnView;
