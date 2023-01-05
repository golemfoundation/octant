import getPathObject from 'utils/routing';

const ROOT = getPathObject('', '');
const PROPOSAL_PREFIX = 'project';

export const ROOT_ROUTES = {
  allocation: getPathObject(ROOT, 'allocation'),
  earn: getPathObject(ROOT, 'earn'),
  metrics: getPathObject(ROOT, 'metrics'),
  proposal: getPathObject(ROOT, PROPOSAL_PREFIX),
  proposalWithId: getPathObject(ROOT, `${PROPOSAL_PREFIX}/:proposalId`),
  proposals: getPathObject(ROOT, 'projects'),
  settings: getPathObject(ROOT, 'settings'),
};
