import cx from 'classnames';
import React, { FC } from 'react';

import LanguageSelector from 'components/shared/LanguageSelector';

import styles from './LanguageSelectorWrapped.module.scss';
import LanguageSelectorWrappedProps from './types';

const LanguageSelectorWrapped: FC<LanguageSelectorWrappedProps> = ({ className }) => (
  <div className={cx(styles.root, className)}>
    <LanguageSelector />
  </div>
);

export default LanguageSelectorWrapped;
