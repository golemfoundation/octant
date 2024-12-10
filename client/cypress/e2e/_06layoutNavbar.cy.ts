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

// Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isMobile }) => {
//   describe(`[AW IS CLOSED] LayoutNavbar: ${device}`, { viewportHeight, viewportWidth }, () => {
//     before(() => {
//       cy.clearLocalStorage();
//     });

//     beforeEach(() => {
//       mockCoinPricesServer();
//       localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
//       localStorage.setItem(IS_ONBOARDING_DONE, 'true');
//       localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
//       visitWithLoader(ROOT.absolute, ROOT_ROUTES.home.absolute);
//     });

//     if (device === 'large-desktop' || device === 'desktop') {
//       it('LayoutNavbar doesn`t exist', () => {
//         cy.get('[data-test=LayoutNavbar]').should('not.exist');
//       });
//     } else {
//       it('LayoutNavbar is visible', () => {
//         cy.get('[data-test=LayoutNavbar]').should('be.visible');
//       });

//       it('LayoutNavbar has correct size and style', () => {
//         cy.get('[data-test=LayoutNavbar]')
//           .invoke('css', 'height')
//           .should('eq', isMobile ? '72px' : '104px');
//         cy.get('[data-test=LayoutNavbar]')
//           .invoke('css', 'width')
//           .should('eq', isMobile ? '342px' : '432px');
//         cy.get('[data-test=LayoutNavbar]')
//           .invoke('css', 'borderRadius')
//           .should('eq', isMobile ? '32px' : '40px');
//         cy.get('[data-test=LayoutNavbar]')
//           .invoke('css', 'boxShadow')
//           .should('eq', 'rgba(0, 0, 0, 0.05) 0px 0px 25px 0px');
//       });

//       it('Every button is visible in correct order, has right style and props', () => {
//         const navbarButtons = [
//           {
//             href: '/home',
//             key: 'home',
//             text: 'Home',
//           },
//           {
//             href: '/projects',
//             key: 'projects',
//             text: 'Projects',
//           },
//           {
//             href: '/allocation',
//             key: 'allocate',
//             text: 'Allocate',
//           },
//           {
//             href: '/metrics',
//             key: 'metrics',
//             text: 'Metrics',
//           },
//           {
//             href: '/settings',
//             key: 'settings',
//             text: 'Settings',
//           },
//         ];

//         cy.get(`[data-test=LayoutNavbar__buttons]`).children().should('have.length', 5);
//         cy.get(`[data-test=LayoutNavbar__buttons]`)
//           .children()
//           .each((el1, idx1) => {
//             cy.get(`[data-test=LayoutNavbar__buttons]`).children().eq(idx1).should('be.visible');
//             cy.get(`[data-test=LayoutNavbar__buttons]`)
//               .children()
//               .eq(idx1)
//               .invoke('text')
//               .should('eq', navbarButtons[idx1].text);
//             cy.get(`[data-test=LayoutNavbar__buttons]`)
//               .children()
//               .eq(idx1)
//               .invoke('attr', 'href')
//               .should('eq', navbarButtons[idx1].href);
//             cy.get(`[data-test=LayoutNavbar__buttons]`)
//               .children()
//               .eq(idx1)
//               .invoke('css', 'height')
//               .should('eq', '72px');
//             cy.get(`[data-test=LayoutNavbar__buttons]`)
//               .children()
//               .eq(idx1)
//               .invoke('css', 'width')
//               .should('eq', '64px');

//             if (idx1 === 0) {
//               cy.get(`[data-test=LayoutNavbar__Button__Svg--${navbarButtons[idx1].key}]`).within(
//                 () => {
//                   cy.get('path')
//                     .eq(1)
//                     .then($el => $el.css('fill'))
//                     .should('be.colored', '#171717');
//                 },
//               );
//             } else {
//               cy.get(`[data-test=LayoutNavbar__Button__Svg--${navbarButtons[idx1].key}]`).within(
//                 () => {
//                   cy.get('path').each((el2, idx2) => {
//                     cy.get('path')
//                       .eq(idx2)
//                       .then($el => $el.css('stroke'))
//                       .should('be.colored', '#cdd1cd');
//                   });
//                 },
//               );
//             }
//           });
//       });

//       it('Home button redirects to HomeView', () => {
//         cy.get('[data-test=LayoutNavbar__Button--home]').click();
//         cy.get('[data-test=HomeView]').should('be.visible');
//         cy.get(`[data-test=LayoutNavbar__Button__Svg--home]`).within(() => {
//           cy.get('path')
//             .eq(1)
//             .then($el => $el.css('fill'))
//             .should('be.colored', '#171717');
//         });
//       });

//       it('Projects button redirects to ProjectsView', () => {
//         cy.get('[data-test=LayoutNavbar__Button--projects]').click();
//         cy.get(`[data-test=LayoutNavbar__Button__Svg--projects]`).within(() => {
//           cy.get('path').each((el, idx) => {
//             cy.get('path')
//               .eq(idx)
//               .then($el => $el.css('stroke'))
//               .should('be.colored', '#171717');
//           });
//         });
//         cy.get('[data-test=ProjectsView]').should('be.visible');
//       });

//       it('Allocate button redirects to AllocationView', () => {
//         cy.get('[data-test=LayoutNavbar__Button--allocate]').click();
//         cy.get(`[data-test=LayoutNavbar__Button__Svg--allocate]`).within(() => {
//           cy.get('path').each((el, idx) => {
//             cy.get('path')
//               .eq(idx)
//               .then($el => $el.css('stroke'))
//               .should('be.colored', '#171717');
//           });
//         });
//         cy.get('[data-test=AllocationView]').should('be.visible');
//       });

//       it('Metrics button redirects to MetricsView', () => {
//         cy.get('[data-test=LayoutNavbar__Button--metrics]').click();
//         cy.get(`[data-test=LayoutNavbar__Button__Svg--metrics]`).within(() => {
//           cy.get('path').each((el, idx) => {
//             cy.get('path')
//               .eq(idx)
//               .then($el => $el.css('stroke'))
//               .should('be.colored', '#171717');
//           });
//         });
//         cy.get('[data-test=MetricsView]').should('be.visible');
//       });

//       it('Settings button redirects to SettingsView', () => {
//         cy.get('[data-test=LayoutNavbar__Button--settings]').click();
//         cy.get(`[data-test=LayoutNavbar__Button__Svg--settings]`).within(() => {
//           cy.get('path').each((el, idx) => {
//             cy.get('path')
//               .eq(idx)
//               .then($el => $el.css('stroke'))
//               .should('be.colored', '#171717');
//           });
//         });
//         cy.get('[data-test=SettingsView]').should('be.visible');
//       });
//     }
//   });
// });
