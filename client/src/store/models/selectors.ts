import { Selector } from 'react-redux';

import { RootStore } from 'store/types';

import { ModelsStore } from './types';

export const modelsSelector: Selector<RootStore, ModelsStore> = state => state.models;
