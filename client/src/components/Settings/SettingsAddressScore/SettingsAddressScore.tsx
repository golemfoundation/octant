import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
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
  scoreHighlight,
  areBottomCornersRounded = true,
  isMessageSigned,
  isSignMessageButtonDisabled,
  onSignMessage,
  mode,
  showActiveDot,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { address: activeAddress } = useAccount();

  const isActive = activeAddress === address;

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
        {showActiveDot && (
          <svg
            className={cx(styles.activeDot, isActive && styles.isActive)}
            fill="none"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className={styles.activeDotCircle}
              cx="6"
              cy="6"
              fill="#2D9B87"
              r="5"
              stroke="#F8F8F8"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>
      <div className={styles.addressWrapper}>
        <div className={styles.address}>{truncateEthAddress(address)}</div>
        <span className={cx(styles.badge, badge === 'secondary' && styles.secondary)}>{badge}</span>
      </div>
      {mode === 'score' && (
        <div
          className={cx(
            styles.score,
            scoreHighlight && styles[`scoreHighlight--${scoreHighlight}`],
          )}
        >
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
            {t('signMessage')}
          </Button>
        ))}
    </motion.div>
  );
};

export default memo(SettingsAddressScore);
