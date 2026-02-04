import React, { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import HomeGrid from 'components/Home/HomeGrid/HomeGrid';
import HomeRewards from 'components/Home/HomeRewards/HomeRewards';
import ViewTitle from 'components/shared/ViewTitle/ViewTitle';
import useIsMigrationMode from 'hooks/helpers/useIsMigrationMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

import styles from './HomeView.module.scss';

const HomeView = (): ReactElement => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'views.home' });
  const { isMobile } = useMediaQuery();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const isInMigrationMode = useIsMigrationMode();
  const dataTestRoot = 'HomeView';

  const title = useMemo(() => {
    if (isInMigrationMode) {
      return t('title.migration');
    }
    if (isDecisionWindowOpen && isMobile) {
      return t('title.isDecisionWindowOpenTrue.mobile', { epoch: currentEpoch! - 1 });
    }
    if (isDecisionWindowOpen && !isMobile) {
      return t('title.isDecisionWindowOpenTrue.desktop', { epoch: currentEpoch! - 1 });
    }
    return t('title.isDecisionWindowOpenFalse', { epoch: currentEpoch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpoch, t, isMobile, isDecisionWindowOpen, i18n.language]);

  return (
    <div className={styles.root} data-test={dataTestRoot}>
      <ViewTitle dataTest={`${dataTestRoot}__title`}>{title}</ViewTitle>
      <HomeRewards />
      <HomeGrid />
    </div>
  );
};

export default HomeView;
