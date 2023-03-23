import { connect } from 'react-redux';

import { Dispatch } from 'store';
import { allocationsSet } from 'store/models/allocations/actions';
import { allocationsSelector } from 'store/models/allocations/selectors';
import { defaultValuesFromLocalStorageSet as defaultValuesFromLocalStorageSetOnboarding } from 'store/models/onboarding/actions';
import { onboardingSelector } from 'store/models/onboarding/selectors';
import {
  defaultValuesFromLocalStorageSet as defaultValuesFromLocalStorageSetSettings,
  isCryptoMainValueDisplaySet,
} from 'store/models/settings/actions';
import { settingsSelector } from 'store/models/settings/selectors';
import { RootStore as State } from 'store/types';

import App from './App';
import { DispatchProps, StateProps } from './types';

const mapStateToProps = (state: State): StateProps => ({
  allocations: allocationsSelector(state),
  onboarding: onboardingSelector(state),
  settings: settingsSelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onDefaultValuesFromLocalStorageSetOnboarding: () =>
    dispatch(defaultValuesFromLocalStorageSetOnboarding()),
  onDefaultValuesFromLocalStorageSetSettings: () =>
    dispatch(defaultValuesFromLocalStorageSetSettings()),
  onSetAllocations: payload => dispatch(allocationsSet(payload)),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  setIsCryptoMainValueDisplay: payload => dispatch(isCryptoMainValueDisplaySet(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
