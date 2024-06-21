import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsAddressScore from 'components/Settings/SettingsAddressScore';
import SettingsProgressPath from 'components/Settings/SettingsProgressPath';
import Modal from 'components/ui/Modal';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';

import styles from './ModalSettingsRecalculatingScore.module.scss';
import ModalSettingsRecalculatingScoreProps from './types';

const ModalSettingsRecalculatingScore: FC<ModalSettingsRecalculatingScoreProps> = ({
  modalProps,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const [lastDoneStep, setLastDoneStep] = useState<null | 0 | 1 | 2>(null);
  const { data: antisybilStatusScore, isSuccess } = useAntisybilStatusScore();

  useEffect(() => {
    if (!isSuccess) {
      return;
    }
    setLastDoneStep(0);
  }, [isSuccess]);

  // "Checking allowlist", "Finished" mock
  useEffect(() => {
    if (lastDoneStep === null) {
      return;
    }
    if (lastDoneStep === 2) {
      setTimeout(() => {
        modalProps.onClosePanel();
      }, 2500);
    }

    setTimeout(
      () =>
        setLastDoneStep(prev => {
          if (prev === null) {
            return 0;
          }
          if (prev === 0) {
            return 1;
          }
          return 2;
        }),
      2500,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastDoneStep]);

  const isScoreHighlighted = !!(lastDoneStep && lastDoneStep >= 1);
  const score =
    lastDoneStep && lastDoneStep >= 1 && antisybilStatusScore ? antisybilStatusScore : 0;

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalSettingsRecalculatingScore"
      header={t('recalculatingScore')}
      {...modalProps}
    >
      <SettingsAddressScore
        address="0xe5e11cc5fb894eF5A9D7Da768cFb17066b9d35D7"
        areBottomCornersRounded={false}
        badge="primary"
        isScoreHighlighted={isScoreHighlighted}
        mode="score"
        score={score}
      />
      <SettingsProgressPath lastDoneStep={lastDoneStep} />
    </Modal>
  );
};

export default ModalSettingsRecalculatingScore;
