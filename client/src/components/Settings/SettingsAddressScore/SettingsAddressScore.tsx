import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC, memo } from 'react';
import { useAccount } from 'wagmi';

import Button from 'components/ui/Button';
import Identicon from 'components/ui/Identicon';
import Svg from 'components/ui/Svg';
import { checkMark } from 'svg/misc';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './SettingsAddressScore.module.scss';
import SettingsAddressScoreProps from './types';

const SettingsAddressScore: FC<SettingsAddressScoreProps> = ({
  address,
  badge,
  score,
  className,
  isScoreHighlighted = false,
  areBottomCornersRounded = true,
  isMessageSigned,
  isSignMessageButtonDisabled,
  onSignMessage,
  mode,
}) => {
  const { address: activeAddress } = useAccount();

  return (
    <motion.div
      className={cx(
        styles.root,
        areBottomCornersRounded && styles.areBottomCornersRounded,
        className,
      )}
      layout
    >
      <div className={styles.avatar}>
        <Identicon className={styles.identicon} username={address} />
      </div>
      <div className={styles.addressWrapper}>
        <div className={cx(styles.address, activeAddress === address && styles.isActive)}>
          {truncateEthAddress(address)}
        </div>
        <span className={cx(styles.badge, badge === 'secondary' && styles.secondary)}>{badge}</span>
      </div>
      {mode === 'score' && (
        <div className={cx(styles.score, isScoreHighlighted && styles.isScoreHighlighted)}>
          {score}
        </div>
      )}
      {mode === 'sign' &&
        (isMessageSigned ? (
          <Svg img={checkMark} size={3.6} />
        ) : (
          <Button
            isDisabled={isSignMessageButtonDisabled}
            onClick={onSignMessage}
            variant="secondary2"
          >
            Sign message
          </Button>
        ))}
    </motion.div>
  );
};

export default memo(SettingsAddressScore);
