// // eslint-disable-next-line import/no-extraneous-dependencies
// import chaiColors from 'chai-colors';

// import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
// import viewports from 'cypress/utils/viewports';
// import {
//   HAS_ONBOARDING_BEEN_CLOSED,
//   IS_ONBOARDING_ALWAYS_VISIBLE,
//   IS_ONBOARDING_DONE,
// } from 'src/constants/localStorageKeys';
// import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

// chai.use(chaiColors);

// Object.values(viewports).forEach(
//   ({ device, viewportWidth, viewportHeight, isMobile, isTablet }) => {
//     describe(`[AW IS OPEN] Home: ${device}`, { viewportHeight, viewportWidth }, () => {
//       before(() => {
//         cy.clearLocalStorage();
//       });

//       beforeEach(() => {
//         mockCoinPricesServer();
//         localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
//         localStorage.setItem(IS_ONBOARDING_DONE, 'true');
//         localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
//         visitWithLoader(ROOT.absolute, ROOT_ROUTES.home.absolute);
//       });

//       it('Home view title is visible (each viewport)', () => {
//         cy.get('[data-test=HomeView__title]').should('be.visible');
//       });

//       it('Home rewards section is visible (each viewport)', () => {
//         cy.get('[data-test=HomeRewards]').should('be.visible');
//       });

//       it('"Rewards rate" label has tooltip with correct text', () => {
//         cy.get('[data-test=HomeRewards__Tooltip--rewardsRate]').should('be.visible');
//         if (isMobile || isTablet) {
//           cy.get('[data-test=HomeRewards__Tooltip--rewardsRate]').click();
//         } else {
//           cy.get('[data-test=HomeRewards__Tooltip--rewardsRate]').trigger('mouseover');
//         }

//         cy.get('[data-test=HomeRewards__Tooltip--rewardsRate__content]').should('exist');
//         cy.get('[data-test=HomeRewards__Tooltip--rewardsRate__content]')
//           .invoke('text')
//           .should(
//             'eq',
//             'Rewards rate is the percentage of your locked GLM you earn as rewards per epoch',
//           );
//       });

//       it('HomeGrid tiles are visible in correct order ', () => {
//         cy.get('[data-test=HomeGrid]')
//           .children()
//           .should('have.length', isMobile ? 8 : 10);
//         cy.get('[data-test=HomeGrid]').children().eq(0).should('be.visible');
//         cy.get('[data-test=HomeGrid]')
//           .children()
//           .eq(0)
//           .invoke('data', 'test')
//           .should('eq', 'HomeGridCurrentGlmLock');
//         cy.get('[data-test=HomeGrid]').children().eq(1).should('be.visible');
//         cy.get('[data-test=HomeGrid]')
//           .children()
//           .eq(1)
//           .invoke('data', 'test')
//           .should('eq', 'HomeGridDonations');
//         cy.get('[data-test=HomeGrid]').children().eq(2).should('be.visible');
//         cy.get('[data-test=HomeGrid]')
//           .children()
//           .eq(2)
//           .invoke('data', 'test')
//           .should('eq', 'HomeGridPersonalAllocation');
//         cy.get('[data-test=HomeGrid]').children().eq(3).should('be.visible');
//         cy.get('[data-test=HomeGrid]')
//           .children()
//           .eq(3)
//           .invoke('data', 'test')
//           .should('eq', 'HomeGridUQScore');
//         cy.get('[data-test=HomeGrid]').children().eq(4).should('be.visible');
//         cy.get('[data-test=HomeGrid]')
//           .children()
//           .eq(4)
//           .invoke('data', 'test')
//           .should('eq', isMobile ? 'HomeGridVideoBar' : 'HomeGrid__divider--1');
//         cy.get('[data-test=HomeGrid]').children().eq(5).should('be.visible');
//         cy.get('[data-test=HomeGrid]')
//           .children()
//           .eq(5)
//           .invoke('data', 'test')
//           .should('eq', isMobile ? 'HomeGridTransactions' : 'HomeGridVideoBar');
//         cy.get('[data-test=HomeGrid]').children().eq(6).should('be.visible');
//         cy.get('[data-test=HomeGrid]')
//           .children()
//           .eq(6)
//           .invoke('data', 'test')
//           .should('eq', isMobile ? 'HomeGridRewardsEstimator' : 'HomeGrid__divider--2');
//         cy.get('[data-test=HomeGrid]').children().eq(7).should('be.visible');
//         cy.get('[data-test=HomeGrid]')
//           .children()
//           .eq(7)
//           .invoke('data', 'test')
//           .should('eq', isMobile ? 'HomeGridEpochResults' : 'HomeGridTransactions');
//         if (!isMobile) {
//           cy.get('[data-test=HomeGrid]').children().eq(8).should('be.visible');
//           cy.get('[data-test=HomeGrid]')
//             .children()
//             .eq(8)
//             .invoke('data', 'test')
//             .should('eq', 'HomeGridRewardsEstimator');
//           cy.get('[data-test=HomeGrid]').children().eq(9).should('be.visible');
//           cy.get('[data-test=HomeGrid]')
//             .children()
//             .eq(9)
//             .invoke('data', 'test')
//             .should('eq', 'HomeGridEpochResults');
//         }
//       });
//     });
//   },
// );
