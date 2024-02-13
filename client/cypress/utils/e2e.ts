import clientReactQuery from 'src/api/clients/client-react-query';
import { wagmiConfig } from 'src/api/clients/client-wagmi';
import { QUERY_KEYS } from 'src/api/queryKeys';
import { navigationTabs } from 'src/constants/navigationTabs/navigationTabs';
import { readContractEpochs } from 'src/hooks/contracts/readContracts';

import Chainable = Cypress.Chainable;

export const loadersShouldNotExist = (): Chainable<any> => {
  cy.get('[data-test*=AppLoader]').should('not.exist');
  return cy.get('[data-test=MainLayout__Loader]').should('not.exist');
};

export const checkLocationWithLoader = (url: string): Chainable<any> => {
  cy.location('pathname').should('eq', url);
  return loadersShouldNotExist();
};

export const visitWithLoader = (urlEnter: string, urlEnd?: string): Chainable<any> => {
  cy.visit(urlEnter);
  return checkLocationWithLoader(urlEnd || urlEnter);
};

export const navigateWithCheck = (urlEnter: string): Chainable<any> => {
  const { label } = navigationTabs.find(({ to }) => to === urlEnter)!;
  cy.get(`[data-test=Navbar__Button--${label}]`).click();
  return checkLocationWithLoader(urlEnter);
};

export const mockCoinPricesServer = (): Chainable<any> => {
  return cy.intercept('GET', '/simple/price?*', {
    body: { ethereum: { usd: 2041.91 }, golem: { usd: 0.260878 } },
    statusCode: 200,
  });
};
// How to use moveToNextEpoch method?
// Example test below
// it('changes epoch', () => {
//   cy.wrap(null, { timeout: 60000 }).then(() => {
//     return moveToNextEpoch().then(isEpochChanged => {
//       expect(isEpochChanged).to.be.true;
//     });
//   });
// });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const moveToNextEpoch = () =>
  new Cypress.Promise(async (resolve, reject) => {
    const currentEpochPromise = clientReactQuery.fetchQuery({
      queryFn: () =>
        readContractEpochs({
          functionName: 'getCurrentEpoch',
          publicClient: wagmiConfig.publicClient,
        }),
      queryKey: QUERY_KEYS.currentEpoch,
    });

    const blockPromise = wagmiConfig.publicClient.getBlock();

    const currentEpochEndPromise = await clientReactQuery.fetchQuery({
      queryFn: () =>
        readContractEpochs({
          functionName: 'getCurrentEpochEnd',
          publicClient: wagmiConfig.publicClient,
        }),
      queryKey: QUERY_KEYS.currentEpochEnd,
    });

    const [currentEpochEnd, block, currentEpoch] = await Promise.all([
      currentEpochEndPromise,
      blockPromise,
      currentEpochPromise,
    ]);

    if (currentEpoch === undefined || block === undefined || currentEpoch === undefined) {
      reject('Undefined data');
    }

    const blockTimestamp = Number(block.timestamp);
    const currentEpochEndTimestamp = Number(currentEpochEnd);

    const timeToIncrease = currentEpochEndTimestamp - blockTimestamp + 10; // [s]
    await wagmiConfig.publicClient.request({
      method: 'evm_increaseTime' as any,
      params: [timeToIncrease] as any,
    });
    await wagmiConfig.publicClient.request({ method: 'evm_mine' as any, params: [] as any });

    const currentEpochAfter = await clientReactQuery.fetchQuery({
      queryFn: () =>
        readContractEpochs({
          functionName: 'getCurrentEpoch',
          publicClient: wagmiConfig.publicClient,
        }),
      queryKey: QUERY_KEYS.currentEpoch,
    });

    // isEpochChanged
    resolve(Number(currentEpoch) + 1 === Number(currentEpochAfter));
  });
