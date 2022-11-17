import React, { Fragment, ReactElement } from 'react';

import InputCheckbox from 'components/core/input-checkbox/input-checkbox.component';

import styles from './style.module.scss';

const SettingsView = (): ReactElement => {
  return (
    <Fragment>
      Settings view.
      <div className={styles.box}>
        Show Metrics introductions
        <InputCheckbox />
      </div>
    </Fragment>
  );
};

export default SettingsView;
