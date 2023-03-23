import React, { ReactElement } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Description from 'components/core/Description/Description';
import DoubleValueContainer from 'components/core/DoubleValue/DoubleValueContainer';
import Header from 'components/core/Header/Header';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import MetricsTimeSection from 'components/dedicated/MetricsTimeSection/MetricsTimeSection';
import { ETH_STAKED } from 'constants/stake';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useGlmLocked from 'hooks/queries/useGlmLocked';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useLockedRatio from 'hooks/queries/useLockedRatio';
import useProposals from 'hooks/queries/useProposals';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';

import styles from './MetricsView.module.scss';

const MetricsView = (): ReactElement => {
  const { refetch: refetchCurrentEpochProps } = useCurrentEpochProps();
  const { data: currentEpoch, refetch: refetchCurrentEpoch } = useCurrentEpoch({
    refetchOnWindowFocus: true,
  });
  const { refetch: refetchProposals } = useProposals();
  const { data: isDecisionWindowOpen, refetch: refetchIsDecisionWindowOpen } =
    useIsDecisionWindowOpen();
  const { data: glmLocked, refetch: refetchGlmLocked } = useGlmLocked();
  const { data: lockedRatio, refetch: refetchLockedRatio } = useLockedRatio();

  const onCountingFinish = () => {
    refetchCurrentEpoch();
    refetchGlmLocked();
    refetchLockedRatio();
    refetchIsDecisionWindowOpen();
    refetchProposals();
    refetchCurrentEpochProps();
  };

  return (
    <MainLayoutContainer>
      <MetricsTimeSection
        className={styles.element}
        currentEpoch={currentEpoch}
        isDecisionWindowOpen={isDecisionWindowOpen}
        onCountingFinish={onCountingFinish}
      />
      <div className={styles.element}>
        <Header text="Value Locked" />
        <Description
          text="The total value staked on Octant to date, showing ETH staked by the Golem Foundation and
          GLM locked by Octant users."
        />
        <BoxRounded alignment="left" className={styles.box} isVertical title="ETH Staked">
          <DoubleValueContainer cryptoCurrency="ethereum" valueCrypto={ETH_STAKED} />
        </BoxRounded>
        <BoxRounded alignment="left" className={styles.box} isVertical title="GLM Locked">
          <DoubleValueContainer cryptoCurrency="golem" valueCrypto={glmLocked} />
        </BoxRounded>
        <BoxRounded
          alignment="left"
          className={styles.box}
          isVertical
          title="GLM Locked as % of Total Supply"
        >
          <DoubleValueContainer valueString={lockedRatio} />
          <ProgressBar
            className={styles.lockedRatioProgressBar}
            progressPercentage={lockedRatio ? parseFloat(lockedRatio) : 0}
          />
        </BoxRounded>
      </div>
    </MainLayoutContainer>
  );
};

export default MetricsView;
