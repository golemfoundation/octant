import React, { ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

const Head = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'meta' });

  return (
    <Helmet>
      <meta content={t('description')} name="description" />
      <meta content={t('description')} name="og:description" />
      <meta content={`${window.location.hostname}/images/og-image.png`} name="og:image:" />
    </Helmet>
  );
};

export default Head;
