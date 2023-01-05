import { createSelector } from 'reselect';

import { modelsSelector } from 'store/models/selectors';

export const allocationsSelector = createSelector(modelsSelector, ({ allocations }) => allocations);
