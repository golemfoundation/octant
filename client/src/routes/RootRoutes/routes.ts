import getPathObject from 'utils/routing';

export const ROOT = getPathObject('', '');
const PROJECT_PREFIX = 'project';

export const ROOT_ROUTES = {
  allocation: getPathObject(ROOT, 'allocation'),
  earn: getPathObject(ROOT, 'earn'),
  home: getPathObject(ROOT, 'home'),
  metrics: getPathObject(ROOT, 'metrics'),
  playground: getPathObject(ROOT, 'playground'),
  project: getPathObject(ROOT, PROJECT_PREFIX),
  projectWithAddress: getPathObject(ROOT, `${PROJECT_PREFIX}/:epoch/:projectAddress`),
  projects: getPathObject(ROOT, 'projects'),

  settings: getPathObject(ROOT, 'settings'),
};
