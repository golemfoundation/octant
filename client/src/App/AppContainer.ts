import { connect } from 'react-redux';

import { Dispatch } from 'store';
import { RootStore as State } from 'store/types';
import { allocationsSelector } from 'store/models/allocations/selectors';
import { allocationsSet } from 'store/models/allocations/actions';

import { DispatchProps, StateProps } from './types';
import App from './App';

const mapStateToProps = (state: State): StateProps => ({
  allocations: allocationsSelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onSetAllocations: payload => dispatch(allocationsSet(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
