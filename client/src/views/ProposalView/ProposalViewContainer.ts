import { connect } from 'react-redux';

import { allocationsSelector } from 'store/models/allocations/selectors';
import { RootStore as State } from 'store/types';

import ProposalView from './ProposalView';
import { StateProps } from './types';

const mapStateToProps = (state: State): StateProps => ({
  allocations: allocationsSelector(state)!,
});

export default connect(mapStateToProps)(ProposalView);
