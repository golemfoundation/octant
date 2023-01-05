import { connect } from 'react-redux';

import { RootStore as State } from 'store/types';
import { allocationsSelector } from 'store/models/allocations/selectors';

import { StateProps } from './types';
import AllocationView from './AllocationView';

const mapStateToProps = (state: State): StateProps => ({
  allocations: allocationsSelector(state)!,
});

export default connect(mapStateToProps)(AllocationView);
