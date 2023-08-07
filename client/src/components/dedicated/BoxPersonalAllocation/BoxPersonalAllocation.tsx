import { BigNumber } from 'ethers';
import React, { FC, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import ModalWithdrawEth from 'components/dedicated//ModalWithdrawEth/ModalWithdrawEth';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useWithdrawableUserEth from 'hooks/queries/useWithdrawableUserEth';
import useAllocationsStore from 'store/allocations/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import BoxPersonalAllocationProps from './types';

const BoxPersonalAllocation: FC<BoxPersonalAllocationProps> = ({ className }) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.boxPersonalAllocation',
  });
  const { isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: withdrawableUserEth, isFetching: isFetchingWithdrawableUserEth } =
    useWithdrawableUserEth();
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { rewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
    setRewardsForProposals: state.setRewardsForProposals,
  }));

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const isPreLaunch = getIsPreLaunch(currentEpoch);

  const pendingCrypto = individualReward?.sub(rewardsForProposals);

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingWithdrawableUserEth,
        valueCrypto: currentEpoch === 1 ? BigNumber.from(0) : withdrawableUserEth,
      },
      label: i18n.t('common.availableNow'),
    },
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingIndividualReward,
        valueCrypto: currentEpoch === 1 ? BigNumber.from(0) : pendingCrypto,
      },
      label: t('pending'),
    },
  ];

  return (
    <Fragment>
      <BoxRounded
        alignment="left"
        buttonProps={{
          dataTest: 'BoxPersonalAllocation__Button',
          isDisabled: isPreLaunch || !isConnected,
          isHigh: true,
          label: t('withdrawToWallet'),
          onClick: () => setIsModalOpen(true),
          variant: 'secondary',
        }}
        className={className}
        dataTest="BoxPersonalAllocation"
        hasSections
        isVertical
        title={t('personalAllocation')}
      >
        <Sections sections={sections} />
      </BoxRounded>
      <ModalWithdrawEth
        modalProps={{
          isOpen: isModalOpen,
          onClosePanel: () => setIsModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default BoxPersonalAllocation;
