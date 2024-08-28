import _first from 'lodash/first';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import HomeRewards from 'components/Home/HomeRewards/HomeRewards';
import Layout from 'components/shared/Layout';
import ViewTitle from 'components/shared/ViewTitle/ViewTitle';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

import HomeGrid from 'components/Home/HomeGrid/HomeGrid';

const HomeView = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.home' });
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();

  return (
    <Layout dataTest="HomeView">
      <ViewTitle>
        {t('title', { epoch: isDecisionWindowOpen ? currentEpoch : currentEpoch! - 1 })}
      </ViewTitle>
      <HomeRewards />
      <HomeGrid />
    </Layout>
  );
};

export default HomeView;
