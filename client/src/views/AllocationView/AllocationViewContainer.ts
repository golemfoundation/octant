import { connect } from 'react-redux';

import { allocationsSelector } from 'store/models/allocations/selectors';
import { RootStore as State } from 'store/types';

import AllocationView from './AllocationView';
import { StateProps } from './types';

const mapStateToProps = (state: State): StateProps => ({
  allocations: allocationsSelector(state)!,
});

export default connect(mapStateToProps)(AllocationView);
