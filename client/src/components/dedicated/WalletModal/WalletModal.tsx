import cx from 'classnames';
import { formatUnits } from 'ethers/lib/utils';
import React, { FC } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import Modal from 'components/core/Modal/Modal';
import Svg from 'components/core/Svg/Svg';
import RewardsBox from 'components/dedicated/RewardsBox/RewardsBox';
import useAvailableFundsEth from 'hooks/queries/useAvailableFundsEth';
import useAvailableFundsGlm from 'hooks/queries/useAvailableFundsGlm';
import useWallet from 'store/models/wallet/store';
import { golem, ethereum } from 'svg/logo';
import getFormattedEthValue from 'utils/getFormattedEthValue';
import truncateEthAddress from 'utils/truncateEthAddress';

import WalletModalProps from './types';
import styles from './WalletModal.module.scss';

import DoubleValue from '../../core/DoubleValue/DoubleValue';

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

  const array = [
    {
      icon: ethereum,
      value: availableFundsEth ? getFormattedEthValue(availableFundsEth).fullString : '0.0 ETH',
    },
    {
      icon: golem,
      value: `${availableFundsGlm ? formatUnits(availableFundsGlm) : '0.0'} GLM`,
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
        {array.map(({ icon, value }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className={styles.walletCurrency}>
            <Svg classNameSvg={styles.icon} img={icon} size={4} />
            <DoubleValue mainValue={value} variant="small" />
          </div>
        ))}
      </BoxRounded>
      <RewardsBox className={cx(styles.element, styles.box)} />
      <Button className={styles.button} label="Disconnect Wallet" onClick={_disconnect} />
    </Modal>
  );
};

export default WalletModal;
