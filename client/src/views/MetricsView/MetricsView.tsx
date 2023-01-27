import { formatUnits } from 'ethers/lib/utils';
import React, { ReactElement } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Description from 'components/core/Description/Description';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Header from 'components/core/Header/Header';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import MetricsTimeSection from 'components/dedicated/MetricsTimeSection/MetricsTimeSection';
import useCurrentEpoch from 'hooks/useCurrentEpoch';
import useEthStaked from 'hooks/useEthStaked';
import useGlmStaked from 'hooks/useGlmStaked';
import useIsDecisionWindowOpen from 'hooks/useIsDecisionWindowOpen';
import useStakedRatio from 'hooks/useStakedRatio';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';

import styles from './style.module.scss';

const MetricsView = (): ReactElement => {
  const { data: currentEpoch, refetch: refetchCurrentEpoch } = useCurrentEpoch({
    refetchOnWindowFocus: true,
  });
  const { data: isDecisionWindowOpen, refetch: refetchIsDecisionWindowOpen } =
    useIsDecisionWindowOpen();
  const { data: glmStaked, refetch: refetchGlmStaked } = useGlmStaked();
  const { data: stakedRatio, refetch: refetchStakedRatio } = useStakedRatio();
  const { data: ethStaked, refetch: refetchEthStaked } = useEthStaked();

  const onCountingFinish = () => {
    refetchCurrentEpoch();
    refetchGlmStaked();
    refetchEthStaked();
    refetchStakedRatio();
    refetchIsDecisionWindowOpen();
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
        <Header text="Value Staked" />
        <Description
          text="The total value staked on Hexagon to date, showing ETH staked by the Golem Foundation and
          GLM staked by Hexagon users."
        />
        <BoxRounded alignment="left" className={styles.box} isVertical title="ETH Staked">
          <DoubleValue mainValue={ethStaked || '0.0'} />
        </BoxRounded>
        <BoxRounded alignment="left" className={styles.box} isVertical title="GLM Staked">
          <DoubleValue mainValue={glmStaked ? formatUnits(glmStaked) : '0.0'} />
        </BoxRounded>
        <BoxRounded
          alignment="left"
          className={styles.box}
          isVertical
          title="GLM Staked as % of Total Supply"
        >
          <DoubleValue mainValue={`${stakedRatio || '0.0'}%`} />
          <ProgressBar
            className={styles.stakedRatioProgressBar}
            progressPercentage={stakedRatio ? parseFloat(stakedRatio) : 0}
          />
        </BoxRounded>
      </div>
    </MainLayoutContainer>
  );
};

export default MetricsView;
