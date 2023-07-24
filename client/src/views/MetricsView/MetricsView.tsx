import React, { ReactElement } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Description from 'components/core/Description/Description';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Header from 'components/core/Header/Header';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import MetricsTimeSection from 'components/dedicated/MetricsTimeSection/MetricsTimeSection';
import TipTile from 'components/dedicated/TipTile/TipTile';
import { ETH_STAKED } from 'constants/stake';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useLockedSummaryLatest from 'hooks/subgraph/useLockedSummaryLatest';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useTipsStore from 'store/tips/store';

import styles from './MetricsView.module.scss';

const MetricsView = (): ReactElement => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { wasCheckStatusAlreadyClosed, setWasCheckStatusAlreadyClosed } = useTipsStore(state => ({
    setWasCheckStatusAlreadyClosed: state.setWasCheckStatusAlreadyClosed,
    wasCheckStatusAlreadyClosed: state.data.wasCheckStatusAlreadyClosed,
  }));
  const { refetch: refetchCurrentEpochProps } = useCurrentEpochProps();
  const { data: lockedSummaryLatest, refetch: refetchLockedSummaryLatest } =
    useLockedSummaryLatest();
  const { data: currentEpoch, refetch: refetchCurrentEpoch } = useCurrentEpoch({
    refetchOnWindowFocus: true,
  });
  const { refetch: refetchProposals } = useProposalsContract();
  const { data: isDecisionWindowOpen, refetch: refetchIsDecisionWindowOpen } =
    useIsDecisionWindowOpen();

  const onCountingFinish = () => {
    refetchCurrentEpoch();
    refetchLockedSummaryLatest();
    refetchIsDecisionWindowOpen();
    refetchProposals();
    refetchCurrentEpochProps();
  };

  const { isDesktop } = useMediaQuery();
  const isCheckStatsTipVisible = !!currentEpoch && currentEpoch > 0 && !wasCheckStatusAlreadyClosed;
  const isEpoch1 = currentEpoch === 1;

  return (
    <MainLayout dataTest="MetricsView">
      <TipTile
        className={styles.tip}
        image={isDesktop ? 'images/tip-stats-hor.webp' : 'images/tip-stats-vert.webp'}
        infoLabel={i18n.t('common.octantTips')}
        isOpen={isCheckStatsTipVisible}
        onClose={() => setWasCheckStatusAlreadyClosed(true)}
        text={
          <Trans
            components={[<span className={styles.blackText} />]}
            i18nKey="views.metrics.tip.text"
          />
        }
        title={t('tip.title')}
      />
      {!isEpoch1 && (
        <MetricsTimeSection
          className={styles.element}
          currentEpoch={currentEpoch}
          isDecisionWindowOpen={isDecisionWindowOpen}
          onCountingFinish={onCountingFinish}
        />
      )}
      <div className={styles.element}>
        <Header text={t('valueLocked')} />
        <Description text={t('totalValueStakedDescription')} />
        <div className={styles.boxesGroup}>
          <BoxRounded alignment="left" className={styles.box} isVertical title={t('ethStaked')}>
            <DoubleValue
              cryptoCurrency="ethereum"
              dataTest="MetricsView__DoubleValue--ethStaked"
              valueCrypto={ETH_STAKED}
            />
          </BoxRounded>
          <BoxRounded alignment="left" className={styles.box} isVertical title={t('glmLocked')}>
            <DoubleValue cryptoCurrency="golem" valueCrypto={lockedSummaryLatest?.lockedTotal} />
          </BoxRounded>
        </div>
        <BoxRounded
          alignment="left"
          className={styles.box}
          isVertical
          title={t('glmLockedTotalSupplyPercentage')}
        >
          <DoubleValue valueString={lockedSummaryLatest?.lockedRatio} />
          <ProgressBar
            className={styles.lockedRatioProgressBar}
            progressPercentage={
              lockedSummaryLatest ? parseInt(lockedSummaryLatest?.lockedRatio, 10) : 0
            }
          />
        </BoxRounded>
      </div>
    </MainLayout>
  );
};

export default MetricsView;
