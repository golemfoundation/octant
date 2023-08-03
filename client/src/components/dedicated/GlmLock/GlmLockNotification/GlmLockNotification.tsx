import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import networkConfig from 'constants/networkConfig';
import { arrowTopRight, checkMark, notificationIconWarning } from 'svg/misc';

import styles from './GlmLockNotification.module.scss';
import GlmLockNotificationProps from './types';

const ButtonLinkWithIcon: FC<{ children?: React.ReactNode; transactionHash: string }> = ({
  children,
  transactionHash,
}) => {
  return (
    <Button
      className={styles.link}
      href={`${networkConfig.etherscanAddress}/tx/${transactionHash}`}
      variant="link3"
    >
      {children} <Svg img={arrowTopRight} size={0.7} />
    </Button>
  );
};

const GlmLockNotification: FC<GlmLockNotificationProps> = ({
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

  const label = useMemo(() => {
    if (type === 'info' && currentMode === 'lock' && !isLockingApproved) {
      return t('info.lock.notApproved.label');
    }
    if (type === 'success' && currentMode === 'lock') {
      return t('success.labelLocked');
    }
    if (type === 'success' && currentMode === 'unlock') {
      return t('success.labelUnlocked');
    }
  }, [t, currentMode, type, isLockingApproved]);

  const text = useMemo(() => {
    if (type === 'success') {
      return `${keyPrefix}.success.text`;
    }
    if (type === 'info' && currentMode === 'lock' && !isLockingApproved) {
      return `${keyPrefix}.info.lock.notApproved.text`;
    }
  }, [type, currentMode, isLockingApproved]);

  return (
    <BoxRounded className={className} hasPadding={false} isGrey isVertical>
      <div className={styles.notification}>
        <Svg
          classNameWrapper={styles.iconWrapper}
          img={type === 'success' ? checkMark : notificationIconWarning}
          size={3.2}
        />
        <div className={styles.info}>
          {label && <div className={styles.label}>{label}</div>}
          {text && (
            <div className={styles.text}>
              <Trans
                components={
                  type === 'success'
                    ? [<ButtonLinkWithIcon transactionHash={transactionHash!} />]
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

export default GlmLockNotification;
