import { motion } from 'framer-motion';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import { arrowRight } from 'svg/misc';

import styles from './ProposalBackToTopButton.module.scss';

const ProposalBackToTopButton = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.proposal' });

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={styles.root}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <Button
        className={styles.backToTop}
        dataTest="ProposalBackToTopButton__Button"
        onClick={() => {
          window.scrollTo({ behavior: 'smooth', top: 0 });
        }}
        variant="cta"
      >
        {t('backToTop')}
        <Svg classNameSvg={styles.backToTopIcon} img={arrowRight} size={1.2} />
      </Button>
    </motion.div>
  );
};

export default ProposalBackToTopButton;
