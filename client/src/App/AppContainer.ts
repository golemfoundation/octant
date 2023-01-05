import { connect } from 'react-redux';

import { Dispatch } from 'store';
import { RootStore as State } from 'store/types';
import { allocationAdd, allocationsAdd } from 'store/models/allocations/actions';
import { allocationsSelector } from 'store/models/allocations/selectors';

import { DispatchProps, StateProps } from './types';
import App from './App';

const mapStateToProps = (state: State): StateProps => ({
  allocations: allocationsSelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onAddAllocation: payload => dispatch(allocationAdd(payload)),
  onAddAllocations: payload => dispatch(allocationsAdd(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
