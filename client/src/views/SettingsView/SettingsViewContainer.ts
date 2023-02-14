import { connect } from 'react-redux';

import { Dispatch } from 'store';
import { isAllocateOnboardingAlwaysVisibleSet } from 'store/models/settings/actions';
import { isAllocateOnboardingAlwaysVisibleSelector } from 'store/models/settings/selectors';
import { RootStore as State } from 'store/types';

import SettingsView from './SettingsView';
import { DispatchProps, StateProps } from './types';

const mapStateToProps = (state: State): StateProps => ({
  isAllocateOnboardingAlwaysVisible: isAllocateOnboardingAlwaysVisibleSelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  setIsAllocateOnboardingAlwaysVisible: payload =>
    dispatch(isAllocateOnboardingAlwaysVisibleSet(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsView);
