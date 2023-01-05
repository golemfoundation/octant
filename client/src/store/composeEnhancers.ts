import { compose } from 'redux';

const isFunction = (x: unknown): x is Function => x !== undefined && typeof x === 'function';
const REDUX_DEV_TOOLS = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';
const devToolsCompose: unknown = window[REDUX_DEV_TOOLS];
export const composeEnhancers = isFunction(devToolsCompose) ? devToolsCompose({}) : compose;
