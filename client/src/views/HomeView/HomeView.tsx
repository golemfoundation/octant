import _first from 'lodash/first';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import HomeGrid from 'components/Home/HomeGrid/HomeGrid';
import HomeRewards from 'components/Home/HomeRewards/HomeRewards';
import ViewTitle from 'components/shared/ViewTitle/ViewTitle';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

const HomeView = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.home' });
  const { data: currentEpoch } = useCurrentEpoch();

  return (
    <>
      <ViewTitle>{t('title', { epoch: currentEpoch! - 1 })}</ViewTitle>
      <HomeRewards />
      <HomeGrid />
    </>
  );
};

export default HomeView;
