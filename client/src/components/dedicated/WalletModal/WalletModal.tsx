import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useDisconnect } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import Button from 'components/core/Button/Button';
import Modal from 'components/core/Modal/Modal';
import RewardsBox from 'components/dedicated/RewardsBox/RewardsBox';
import useAvailableFundsEth from 'hooks/queries/useAvailableFundsEth';
import useAvailableFundsGlm from 'hooks/queries/useAvailableFundsGlm';
import { golem, ethereum } from 'svg/logo';
import truncateEthAddress from 'utils/truncateEthAddress';

import WalletModalProps from './types';
import styles from './WalletModal.module.scss';

const WalletModal: FC<WalletModalProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.walletModal',
  });
  const { address } = useAccount();
  const { data: availableFundsGlm } = useAvailableFundsGlm();
  const { data: availableFundsEth } = useAvailableFundsEth();
  const { disconnect } = useDisconnect();

  const _disconnect = () => {
    modalProps.onClosePanel();
    disconnect();
  };

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        valueCrypto: availableFundsEth,
      },
      icon: ethereum,
    },
    {
      doubleValueProps: {
        coinPricesServerDowntimeText: '...',
        cryptoCurrency: 'golem',
        valueCrypto: availableFundsGlm,
      },
      icon: golem,
    },
  ];

  return (
    <Modal header={t('balances')} {...modalProps}>
      <BoxRounded
        alignment="left"
        className={cx(styles.element, styles.box)}
        hasSections
        isGrey
        isVertical
        title={t('connectedWalletBalances')}
        titleSuffix={address ? truncateEthAddress(address) : undefined}
      >
        <Sections sections={sections} />
      </BoxRounded>
      <RewardsBox className={cx(styles.element, styles.box)} isGrey />
      <Button className={styles.button} label={t('disconnectWallet')} onClick={_disconnect} />
    </Modal>
  );
};

export default WalletModal;
