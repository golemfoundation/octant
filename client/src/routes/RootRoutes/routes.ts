import getPathObject from 'utils/routing';

export const ROOT = getPathObject('', '');
const PROPOSAL_PREFIX = 'project';

export const ROOT_ROUTES = {
  allocation: getPathObject(ROOT, 'allocation'),
  earn: getPathObject(ROOT, 'earn'),
  metrics: getPathObject(ROOT, 'metrics'),
  proposal: getPathObject(ROOT, PROPOSAL_PREFIX),
  proposalWithAddress: getPathObject(ROOT, `${PROPOSAL_PREFIX}/:proposalAddress`),
  proposals: getPathObject(ROOT, 'projects'),
  settings: getPathObject(ROOT, 'settings'),
};
