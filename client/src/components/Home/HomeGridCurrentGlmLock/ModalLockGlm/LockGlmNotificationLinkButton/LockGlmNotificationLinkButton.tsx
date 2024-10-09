import React, { FC, memo } from 'react';

import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import networkConfig from 'constants/networkConfig';
import { arrowTopRight } from 'svg/misc';

import styles from './LockGlmNotificationLinkButton.module.scss';
import LockGlmNotificationLinkButtonProps from './types';

const LockGlmNotificationLinkButton: FC<LockGlmNotificationLinkButtonProps> = ({
  children,
  transactionHash,
}) => {
  return (
    <Button
      className={styles.root}
      href={`${networkConfig.etherscanAddress}/tx/${transactionHash}`}
      variant="link3"
    >
      {children} <Svg img={arrowTopRight} size={0.7} />
    </Button>
  );
};

export default memo(LockGlmNotificationLinkButton);
