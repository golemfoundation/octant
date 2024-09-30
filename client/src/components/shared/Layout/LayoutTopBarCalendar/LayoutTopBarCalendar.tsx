import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import React, { ReactNode, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import Calendar from 'components/shared/Layout/LayoutTopBarCalendar/Calendar';
import Modal from 'components/ui/Modal';
import Svg from 'components/ui/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import { calendar } from 'svg/misc';

import styles from './LayoutTopBarCalendar.module.scss';

const LayoutTopBarCalendar = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'layout.topBar' });
  const { isMobile } = useMediaQuery();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const allocationInfoText = useMemo(() => {
    const epoch = currentEpoch! - 1;

    if (isDecisionWindowOpen) {
      return isMobile
        ? t('epochAllocationWindowOpenShort', { epoch })
        : t('epochAllocationWindowOpen', { epoch });
    }

    return isMobile
      ? t('epochAllocationWindowClosedShort', { epoch })
      : t('epochAllocationWindowClosed', { epoch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDecisionWindowOpen, currentEpoch, isMobile]);

  return (
    <>
      <div className={styles.allocationInfo} onClick={() => setIsCalendarOpen(true)}>
        {!isMobile && <Svg classNameSvg={styles.calendarIcon} img={calendar} size={1.6} />}
        {allocationInfoText}
      </div>
      {createPortal(
        <AnimatePresence>
          {!isMobile && isCalendarOpen && (
            <>
              <motion.div
                key="overflow"
                animate={{
                  opacity: 1,
                }}
                className={cx(styles.overflow, styles.isOpen)}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                onClick={() => setIsCalendarOpen(false)}
              />
              <motion.div
                key="desktopCalendarWrapper"
                animate={{ opacity: 1, top: 72 }}
                className={styles.desktopCalendarWrapper}
                exit={{ opacity: 0 }}
                initial={{ left: '50%', opacity: 0, top: 64, x: '-50%' }}
              >
                <Calendar />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
      <Modal
        header="Calendar"
        isOpen={isMobile && isCalendarOpen}
        onClosePanel={() => setIsCalendarOpen(false)}
      >
        <Calendar />
      </Modal>
    </>
  );
};

export default LayoutTopBarCalendar;
