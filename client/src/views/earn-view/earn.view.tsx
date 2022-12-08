import { useMetamask } from 'use-metamask';
import React, { ReactElement, useState } from 'react';

import BoxRounded from 'components/core/box-rounded/box-rounded.component';
import DoubleValue from 'components/core/double-value/double-value.component';
import GlmStakingFlow from 'components/dedicated/glm-staking-flow/glm-staking-flow.component';
import MainLayout from 'layouts/main-layout/main.layout';
import useDepositValue from 'hooks/useDepositValue';

import { getCurrentEpochStateText } from './utils';
import styles from './style.module.scss';

const EarnView = (): ReactElement => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const [isGlmStakingModalOpen, setIsGlmStakingModalOpen] = useState<boolean>(false);
  const { data: depositsValue } = useDepositValue();

  return (
    <MainLayout>
      <BoxRounded
        buttonProps={{
          isDisabled: !isConnected,
          isHigh: true,
          label: 'Edit GLM Stake',
          onClick: () => setIsGlmStakingModalOpen(true),
          variant: 'cta',
        }}
        className={styles.box}
        tabs={[
          {
            isActive: true,
            onClick: () => {},
            title: 'Current Epoch Stake',
          },
          {
            title: 'Next Epoch Stake',
          },
        ]}
      >
        <DoubleValue mainValue={getCurrentEpochStateText(isConnected, depositsValue)} />
      </BoxRounded>
      <BoxRounded
        buttonProps={{
          isDisabled: true,
          isHigh: true,
          label: 'Withdraw ETH Rewards',
          variant: 'cta',
        }}
        className={styles.box}
        isVertical
        title="Rewards Balance"
      >
        Withdraw rewards.
      </BoxRounded>
      <GlmStakingFlow
        modalProps={{
          header: 'Stake GLM',
          isOpen: isGlmStakingModalOpen,
          onClosePanel: () => setIsGlmStakingModalOpen(false),
        }}
      />
    </MainLayout>
  );
};

export default EarnView;
