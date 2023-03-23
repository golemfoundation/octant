import cx from 'classnames';
import React, { FC } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import DoubleValueContainer from 'components/core/DoubleValue/DoubleValueContainer';
import Modal from 'components/core/Modal/Modal';
import Svg from 'components/core/Svg/Svg';
import RewardsBox from 'components/dedicated/RewardsBox/RewardsBox';
import useAvailableFundsEth from 'hooks/queries/useAvailableFundsEth';
import useAvailableFundsGlm from 'hooks/queries/useAvailableFundsGlm';
import useWallet from 'store/models/wallet/store';
import { golem, ethereum } from 'svg/logo';
import truncateEthAddress from 'utils/truncateEthAddress';

import WalletModalProps from './types';
import styles from './WalletModal.module.scss';

const WalletModal: FC<WalletModalProps> = ({ modalProps }) => {
  const {
    disconnect,
    wallet: { address },
  } = useWallet();
  const { data: availableFundsGlm } = useAvailableFundsGlm();
  const { data: availableFundsEth } = useAvailableFundsEth();

  const _disconnect = () => {
    modalProps.onClosePanel();
    disconnect();
  };

  const funds = [
    {
      cryptoCurrency: 'ethereum',
      icon: ethereum,
      valueCrypto: availableFundsEth,
    },
    {
      cryptoCurrency: 'golem',
      icon: golem,
      valueCrypto: availableFundsGlm,
    },
  ];

  return (
    <Modal header="Balances" {...modalProps}>
      <BoxRounded
        alignment="left"
        className={cx(styles.element, styles.box)}
        hasSections
        isGrey
        isVertical
        title="Connected Wallet Balances"
        titleSuffix={address ? truncateEthAddress(address) : undefined}
      >
        {funds.map(({ icon, valueCrypto, cryptoCurrency }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className={styles.walletCurrency}>
            <Svg classNameSvg={styles.icon} img={icon} size={4} />
            <DoubleValueContainer
              cryptoCurrency={cryptoCurrency as 'golem' | 'ethereum'}
              valueCrypto={valueCrypto}
              variant="small"
            />
          </div>
        ))}
      </BoxRounded>
      <RewardsBox className={cx(styles.element, styles.box)} />
      <Button className={styles.button} label="Disconnect Wallet" onClick={_disconnect} />
    </Modal>
  );
};

export default WalletModal;
