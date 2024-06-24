import cx from 'classnames';
import React, { FC, memo } from 'react';

import Identicon from 'components/ui/Identicon';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './SettingsAddressScore.module.scss';
import SettingsAddressScoreProps from './types';

const SettingsAddressScore: FC<SettingsAddressScoreProps> = ({
  address,
  badgeLabel,
  score,
  className,
  isScoreHighlighted = false,
  areBottomCornersRounded = true,
}) => {
  return (
    <div
      className={cx(
        styles.root,
        areBottomCornersRounded && styles.areBottomCornersRounded,
        className,
      )}
    >
      <div className={styles.avatar}>
        <Identicon className={styles.identicon} username={address} />
      </div>
      <div>
        <div className={styles.address}>{truncateEthAddress(address)}</div>
        <span className={styles.badge}>{badgeLabel}</span>
      </div>
      <div className={cx(styles.score, isScoreHighlighted && styles.isScoreHighlighted)}>
        {score}
      </div>
    </div>
  );
};

export default memo(SettingsAddressScore);
