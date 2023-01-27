import { connect } from 'react-redux';

import { Dispatch } from 'store';
import { allocationsSet } from 'store/models/allocations/actions';
import { allocationsSelector } from 'store/models/allocations/selectors';
import { RootStore as State } from 'store/types';

import App from './App';
import { DispatchProps, StateProps } from './types';

const mapStateToProps = (state: State): StateProps => ({
  allocations: allocationsSelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onSetAllocations: payload => dispatch(allocationsSet(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
