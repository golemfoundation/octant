import cx from 'classnames';
import React, { FC, memo } from 'react';

import styles from './SettingsAddressScore.module.scss';
import Identicon from 'components/ui/Identicon';
import SettingsAddressScoreProps from './types';
import truncateEthAddress from 'utils/truncateEthAddress';

const SettingsAddressScore: FC<SettingsAddressScoreProps> = ({
  address,
  badgeLabel,
  score,
  className,
  isScoreHighlighted = false,
}) => {
  return (
    <div className={cx(styles.root, className)}>
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
