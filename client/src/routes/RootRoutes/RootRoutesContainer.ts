import { connect } from 'react-redux';

import { isOnboardingDoneSelector } from 'store/models/onboarding/selectors';
import { RootStore as State } from 'store/types';

import RootRoutes from './RootRoutes';
import { StateProps } from './types';

const mapStateToProps = (state: State): StateProps => ({
  isOnboardingDone: isOnboardingDoneSelector(state)!,
});

export default connect(mapStateToProps)(RootRoutes);
