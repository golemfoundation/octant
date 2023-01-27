import { connect } from 'react-redux';

import { allocationsSelector } from 'store/models/allocations/selectors';
import { RootStore as State } from 'store/types';

import MainLayout from './MainLayout';
import { OwnProps, StateProps } from './types';

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => ({
  allocations: allocationsSelector(state)!,
  ...ownProps,
});

export default connect(mapStateToProps)(MainLayout);
