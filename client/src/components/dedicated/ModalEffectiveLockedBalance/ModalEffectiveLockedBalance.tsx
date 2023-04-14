import React, { FC } from 'react';

import modalEffectiveLockedBalance from 'assets/images/modalEffectiveLockedBalance.png';
import Img from 'components/core/Img/Img';
import Modal, { Text } from 'components/core/Modal/Modal';

import styles from './ModalEffectiveLockedBalance.module.scss';
import ModalEffectiveLockedBalanceProps from './types';

const ModalEffectiveLockedBalance: FC<ModalEffectiveLockedBalanceProps> = ({ modalProps }) => (
  <Modal
    {...modalProps}
    header="Effective Locked Balance"
    Image={<Img className={styles.image} src={modalEffectiveLockedBalance} />}
  >
    <Text>
      Effective Balance refers to Locked GLM that has been locked for a full epoch and is generating
      rewards. Rewards for GLM locked during Epoch <span className={styles.bold}>T</span> will be
      available in Epoch <span className={styles.bold}>T+2</span>.
      <br />
      <br />
      Consider locking 100 GLM in Epoch 1 and 1000 GLM in Epoch 2. During Epoch 2 Locked Balance
      will be 1100 GLM, but Effective Balance will be 100 GLM, because the 1000 GLM has not been
      locked for a full epoch yet.
      <br />
      <br />
      During Epoch 3, rewards will be generated on the entire balance, so Effective Balance will
      become 1100 GLM.
    </Text>
  </Modal>
);

export default ModalEffectiveLockedBalance;
