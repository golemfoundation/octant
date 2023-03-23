import { connect } from 'react-redux';

import {
  displayCurrencySelector,
  isCryptoMainValueDisplaySelector,
} from 'store/models/settings/selectors';
import { RootStore as State } from 'store/types';

import DoubleValue from './DoubleValue';
import { OwnProps, StateProps } from './types';

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => ({
  displayCurrency: displayCurrencySelector(state)!,
  isCryptoMainValueDisplay: isCryptoMainValueDisplaySelector(state)!,
  ...ownProps,
});

export default connect(mapStateToProps)(DoubleValue);
