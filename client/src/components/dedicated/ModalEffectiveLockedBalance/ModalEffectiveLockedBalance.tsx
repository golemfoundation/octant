import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import Img from 'components/core/Img/Img';
import Modal from 'components/core/Modal/Modal';
import Text from 'components/core/Text/Text';

import styles from './ModalEffectiveLockedBalance.module.scss';
import ModalEffectiveLockedBalanceProps from './types';

const ModalEffectiveLockedBalance: FC<ModalEffectiveLockedBalanceProps> = ({ modalProps }) => (
  <Modal
    {...modalProps}
    header="Effective Locked Balance"
    Image={
      <div className={styles.imageWrapper}>
        <Img className={styles.image} src="images/modalEffectiveLockedBalance.webp" />
      </div>
    }
  >
    <Text>
      <Trans
        components={[<span className={styles.bold} />, <span className={styles.bold} />]}
        i18nKey="components.dedicated.modalEffectiveLockedBalance.text"
      />
    </Text>
  </Modal>
);

export default ModalEffectiveLockedBalance;
