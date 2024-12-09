import networkConfig from './networkConfig';

export default window.Cypress ? !!window.isTestnetCypress : networkConfig.isTestnet;
