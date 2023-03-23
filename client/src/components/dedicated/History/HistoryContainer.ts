import { connect } from 'react-redux';

import {
  displayCurrencySelector,
  isCryptoMainValueDisplaySelector,
} from 'store/models/settings/selectors';
import { RootStore as State } from 'store/types';

import History from './History';
import { StateProps } from './types';

const mapStateToProps = (state: State): StateProps => ({
  displayCurrency: displayCurrencySelector(state)!,
  isCryptoMainValueDisplay: isCryptoMainValueDisplaySelector(state)!,
});

export default connect(mapStateToProps)(History);
