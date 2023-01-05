import { connect } from 'react-redux';

import { RootStore as State } from 'store/types';
import { allocationsSelector } from 'store/models/allocations/selectors';

import { OwnProps, StateProps } from './types';
import MainLayout from './MainLayout';

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => ({
  allocations: allocationsSelector(state)!,
  ...ownProps,
});

export default connect(mapStateToProps)(MainLayout);
