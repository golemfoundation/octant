import cx from 'classnames';
import { differenceInMinutes } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import Calendar from 'components/shared/Layout/LayoutTopBarCalendar/Calendar';
import Modal from 'components/ui/Modal';
import Svg from 'components/ui/Svg';
import { TOURGUIDE_ELEMENT_2 } from 'constants/domElementsIds';
import useIsMigrationMode from 'hooks/helpers/useIsMigrationMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useEpochsStartEndTime from 'hooks/subgraph/useEpochsStartEndTime';
import { calendar } from 'svg/misc';

import styles from './LayoutTopBarCalendar.module.scss';
import LayoutTopBarCalendarProps from './types';

const LayoutTopBarCalendar: FC<LayoutTopBarCalendarProps> = ({ className }) => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'layout.topBar' });
  const dataTestRoot = 'LayoutTopBarCalendar';
  const { isMobile } = useMediaQuery();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: epochsStartEndTime, isFetching: isFetchingEpochStartEndTime } =
    useEpochsStartEndTime();
  const isInMigrationMode = useIsMigrationMode();
  const [durationToChangeAWInMinutes, setDurationToChangeAWInMinutes] = useState(0);
  const [showAWAlert, setShowAWAlert] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const allocationInfoText = useMemo(() => {
    const epoch = isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!;

    const durationMinutes = `${durationToChangeAWInMinutes}${isMobile ? `${t('minutesShort')}` : ` ${t('minutes', { count: durationToChangeAWInMinutes })}`}`;

    const durationToChangeAWInHours = Math.floor(durationToChangeAWInMinutes / 60);
    const durationHours = `${durationToChangeAWInHours}${isMobile ? `${t('hoursShort')}` : ` ${t('hours', { count: durationToChangeAWInHours })}`}`;

    const durationToChangeAWInDays = Math.ceil(durationToChangeAWInHours / 24);
    const durationDays = `${durationToChangeAWInDays} ${t('days', { count: durationToChangeAWInDays })}`;

    let duration = durationDays;

    if (durationToChangeAWInHours <= 24) {
      duration = durationHours;
    }
    if (durationToChangeAWInMinutes <= 60) {
      duration = durationMinutes;
    }

    if (isDecisionWindowOpen) {
      if (showAWAlert) {
        return isMobile
          ? t('epochAllocationClosesInShort', { duration })
          : t('epochAllocationClosesIn', {
              duration,
              epoch,
            });
      }

      return isMobile
        ? t('epochAllocationWindowOpenShort', { epoch })
        : t('epochAllocationWindowOpen', { epoch });
    }

    if (isMobile) {
      return t('epochAllocationOpensInShort', { duration });
    }
    return t('epochAllocationOpensIn', { duration, epoch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDecisionWindowOpen,
    currentEpoch,
    isMobile,
    durationToChangeAWInMinutes,
    showAWAlert,
    i18n.language,
  ]);

  useEffect(() => {
    if (
      currentEpoch === undefined ||
      !epochsStartEndTime ||
      isDecisionWindowOpen === undefined ||
      epochsStartEndTime.length !== currentEpoch
    ) {
      return;
    }

    const epochData = epochsStartEndTime[currentEpoch! - 1];
    const allocationWindowEndTimestamp =
      (parseInt(epochData?.fromTs, 10) + parseInt(epochData.decisionWindow, 10)) * 1000;
    const nextAllocationWindowStartTimestamp = parseInt(epochData?.toTs, 10) * 1000;

    const setNextDuration = () => {
      const minutes =
        Math.abs(
          differenceInMinutes(
            isDecisionWindowOpen
              ? allocationWindowEndTimestamp
              : nextAllocationWindowStartTimestamp,
            new Date(),
          ),
        ) || 1;

      setDurationToChangeAWInMinutes(minutes);

      setShowAWAlert(isDecisionWindowOpen && minutes <= 7 * 24 * 60);
    };

    setNextDuration();

    const intervalId = setInterval(setNextDuration, 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!epochsStartEndTime, isDecisionWindowOpen, isFetchingEpochStartEndTime]);

  const calendarProps = { durationToChangeAWInMinutes, showAWAlert };

  return (
    <>
      <div
        className={cx(
          styles.allocationInfo,
          isInMigrationMode && styles.isInMigrationMode,
          showAWAlert && styles.showAWAlert,
          className,
        )}
        data-test={dataTestRoot}
        id={TOURGUIDE_ELEMENT_2}
        onClick={isInMigrationMode ? () => {} : () => setIsCalendarOpen(true)}
      >
        {!isMobile && <Svg classNameSvg={styles.calendarIcon} img={calendar} size={1.6} />}
        {isInMigrationMode ? t('migration.calendar.text') : allocationInfoText}
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
                data-test={`${dataTestRoot}__calendarOverflow`}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                onClick={() => setIsCalendarOpen(false)}
              />
              <motion.div
                key="desktopCalendarWrapper"
                animate={{ opacity: 1, top: 72 }}
                className={styles.desktopCalendarWrapper}
                data-test={`${dataTestRoot}__calendarWrapper`}
                exit={{ opacity: 0 }}
                initial={{ left: '50%', opacity: 0, top: 64, x: '-50%' }}
              >
                <Calendar {...calendarProps} />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
      <Modal
        dataTest={`${dataTestRoot}__ModalCalendar`}
        header={t('calendar')}
        isOpen={isMobile && isCalendarOpen}
        onClosePanel={() => setIsCalendarOpen(false)}
      >
        <Calendar {...calendarProps} />
      </Modal>
    </>
  );
};

export default LayoutTopBarCalendar;
