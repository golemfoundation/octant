import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import HomeGrid from 'components/Home/HomeGrid/HomeGrid';
import HomeRewards from 'components/Home/HomeRewards/HomeRewards';
import ViewTitle from 'components/shared/ViewTitle/ViewTitle';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

const HomeView = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.home' });
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  return (
    <>
      <ViewTitle>
        {t('title', { epoch: isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch })}
      </ViewTitle>
      <HomeRewards />
      <HomeGrid />
    </>
  );
};

export default HomeView;
