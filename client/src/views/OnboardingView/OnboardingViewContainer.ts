import { connect } from 'react-redux';

import { Dispatch } from 'store';
import { setIsOnboardingDone } from 'store/models/onboarding/actions';

import OnboardingView from './OnboardingView';
import { DispatchProps } from './types';

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  setIsOnboardingDone: payload => dispatch(setIsOnboardingDone(payload)),
});

export default connect(null, mapDispatchToProps)(OnboardingView);
