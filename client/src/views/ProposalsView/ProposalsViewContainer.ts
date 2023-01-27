import { connect } from 'react-redux';

import { allocationsSelector } from 'store/models/allocations/selectors';
import { RootStore as State } from 'store/types';

import ProposalsView from './ProposalsView';
import { StateProps } from './types';

const mapStateToProps = (state: State): StateProps => ({
  allocations: allocationsSelector(state)!,
});

export default connect(mapStateToProps)(ProposalsView);
