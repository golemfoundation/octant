import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC, memo } from 'react';

import Identicon from 'components/ui/Identicon';
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
  isSelected,
  mode,
}) => {
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
      <div>
        <div className={styles.address}>{truncateEthAddress(address)}</div>
        <span className={cx(styles.badge, badge === 'secondary' && styles.secondary)}>{badge}</span>
      </div>
      {mode === 'score' ? (
        <div className={cx(styles.score, isScoreHighlighted && styles.isScoreHighlighted)}>
          {score}
        </div>
      ) : (
        <svg
          className={cx(styles.selector, isSelected && styles.isSelected)}
          height="32"
          viewBox="0 0 32 32"
          width="32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle className={styles.circle} cx="16" cy="16" r="8" />
        </svg>
      )}
    </motion.div>
  );
};

export default memo(SettingsAddressScore);
