import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import Svg from 'components/ui/Svg';
import { checkMark, notificationIconWarning } from 'svg/misc';

import styles from './LockGlmNotification.module.scss';
import LockGlmNotificationProps from './types';

import LockGlmNotificationLinkButton from '../LockGlmNotificationLinkButton';

const LockGlmNotification: FC<LockGlmNotificationProps> = ({
  className,
  isLockingApproved,
  type,
  transactionHash,
  currentMode,
}) => {
  const keyPrefix = 'components.dedicated.glmLock.glmLockNotification';

  const { t } = useTranslation('translation', {
    keyPrefix,
  });

  const labelKey = useMemo(() => {
    if (type === 'info' && currentMode === 'lock' && !isLockingApproved) {
      return `${keyPrefix}.info.lock.notApproved.label`;
    }
    if (type === 'success' && currentMode === 'lock') {
      return `${keyPrefix}.success.labelLocked`;
    }
    if (type === 'success' && currentMode === 'unlock') {
      return `${keyPrefix}.success.labelUnlocked`;
    }
  }, [currentMode, type, isLockingApproved]);

  const text = useMemo(() => {
    if (type === 'success') {
      return `${keyPrefix}.success.text`;
    }
    if (type === 'info' && currentMode === 'lock' && !isLockingApproved) {
      return `${keyPrefix}.info.lock.notApproved.text`;
    }
  }, [type, currentMode, isLockingApproved]);

  return (
    <BoxRounded
      className={className}
      dataTest={`GlmLockNotification--${type}`}
      hasPadding={false}
      isGrey
      isVertical
    >
      <div className={styles.notification}>
        <Svg img={type === 'success' ? checkMark : notificationIconWarning} size={3.2} />
        <div className={styles.info}>
          {labelKey && <div className={styles.label}>{t(labelKey)}</div>}
          {text && (
            <div className={styles.text}>
              <Trans
                components={
                  type === 'success'
                    ? [<LockGlmNotificationLinkButton transactionHash={transactionHash!} />]
                    : undefined
                }
                i18nKey={text}
              />
            </div>
          )}
        </div>
      </div>
    </BoxRounded>
  );
};

export default LockGlmNotification;
