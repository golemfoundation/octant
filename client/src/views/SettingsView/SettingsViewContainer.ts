import { connect } from 'react-redux';

import { Dispatch } from 'store';
import {
  isAllocateOnboardingAlwaysVisibleSet,
  displayCurrencySet,
  isCryptoMainValueDisplaySet,
} from 'store/models/settings/actions';
import {
  isAllocateOnboardingAlwaysVisibleSelector,
  displayCurrencySelector,
  isCryptoMainValueDisplaySelector,
} from 'store/models/settings/selectors';
import { RootStore as State } from 'store/types';

import SettingsView from './SettingsView';
import { DispatchProps, StateProps } from './types';

const mapStateToProps = (state: State): StateProps => ({
  displayCurrency: displayCurrencySelector(state),
  isAllocateOnboardingAlwaysVisible: isAllocateOnboardingAlwaysVisibleSelector(state),
  isCryptoMainValueDisplay: isCryptoMainValueDisplaySelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  setDisplayCurrency: payload => dispatch(displayCurrencySet(payload)),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  setIsAllocateOnboardingAlwaysVisible: payload =>
    dispatch(isAllocateOnboardingAlwaysVisibleSet(payload)),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  setIsCryptoMainValueDisplay: payload => dispatch(isCryptoMainValueDisplaySet(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsView);
