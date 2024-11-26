// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import { moveTime, setupAndMoveToPlayground } from 'cypress/utils/moveTime';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

// Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isMobile }) => {
//   describe(`[AW IS CLOSED] Calendar: ${device}`, { viewportHeight, viewportWidth }, () => {
//     before(() => {
//       cy.clearLocalStorage();
//     });

//     beforeEach(() => {
//       mockCoinPricesServer();
//       localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
//       localStorage.setItem(IS_ONBOARDING_DONE, 'true');
//       localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
//       const now = Date.UTC(2024, 2, 19, 9, 30, 0, 0);
//       cy.clock(now, ['Date']);
//       visitWithLoader(ROOT.absolute, ROOT_ROUTES.home.absolute);
//     });

//     it('Epoch info badge opens Calendar on click', () => {
//       cy.get('[data-test=LayoutTopBarCalendar]').click();
//       cy.wait(2000);
//       cy.get('[data-test=Calendar]').should('be.visible');
//     });

//     it('Clicking on overlay closes the Calendar', () => {
//       cy.wait(2000);
//       cy.get('[data-test=LayoutTopBarCalendar]').click();
//       cy.get('[data-test=Calendar]').should('be.visible');
//       if (isMobile) {
//         cy.get('[data-test=LayoutTopBarCalendar__ModalCalendar__overflow]').click({
//           force: true,
//         });
//       } else {
//         cy.get('[data-test=LayoutTopBarCalendar__calendarOverflow]').click();
//       }
//       cy.get('[data-test=Calendar]').should('not.exist');
//     });

//     it('Active milestone (e3-snapshot-vote) is always visible after calendar open (and has correct style)', () => {
//       cy.get('[data-test=LayoutTopBarCalendar]').click();
//       cy.wait(2000);
//       cy.get('[data-test=CalendarItem][data-is-active=true]').should('be.visible');
//       cy.get('[data-test=CalendarItem][data-is-active=true]')
//         .invoke('css', 'opacity')
//         .should('eq', '1');
//       cy.get('[data-test=CalendarItem][data-is-active=true]')
//         .then($el => $el.css('backgroundColor'))
//         .should('be.colored', '#f1faf8');
//       cy.get('[data-test=CalendarItem][data-is-active=true]').within(() => {
//         cy.get('[data-test=CalendarItem__title__day]')
//           .then($el => $el.css('color'))
//           .should('be.colored', '#2d9b87');
//         cy.get('[data-test=CalendarItem__title__monthShort]')
//           .then($el => $el.css('color'))
//           .should('be.colored', '#2d9b87');
//         cy.get('[data-test=CalendarItem__label]').invoke('text').should('eq', 'Snapshot vote');
//         cy.get('[data-test=CalendarItem__label]')
//           .then($el => $el.css('color'))
//           .should('be.colored', '#2d9b87');
//         cy.get('[data-test=CalendarItem__date]')
//           .then($el => $el.css('color'))
//           .should('be.colored', '#2d9b87');
//       });
//     });

//     it('Milestone (e3-snapshot-vote) with "to" param shows end date of event', () => {
//       cy.get('[data-test=LayoutTopBarCalendar]').click();
//       cy.wait(2000);
//       cy.get('[data-test=CalendarItem][data-is-active=true]').within(() => {
//         cy.get('[data-test=CalendarItem__date]')
//           .invoke('text')
//           .should('eq', 'Closes 22 March 12am CET');
//       });
//     });

//     it('Milestone (e3-project-updates-close) without "to" param shows hour and timezone of event start', () => {
//       cy.get('[data-test=LayoutTopBarCalendar]').click();
//       cy.wait(2000);
//       cy.get('[data-test=CalendarItem]')
//         .eq(2)
//         .within(() => {
//           cy.get('[data-test=CalendarItem__date]').invoke('text').should('eq', '12am CET');
//         });
//     });

//     if (isMobile) {
//       it('User can scroll through milestones by drag&drop vertically', () => {
//         cy.get('[data-test=LayoutTopBarCalendar]').click();
//         cy.wait(2000);
//         cy.get('[data-test=CalendarItem][data-is-active=true]').then($calendarItemActive => {
//           const { top: calendarItemActiveTop } = $calendarItemActive[0].getBoundingClientRect();

//           cy.get('[data-test=CalendarItem]').eq(2).should('not.be.visible');
//           cy.get('[data-test=CalendarItem]')
//             .eq(2)
//             .then($prevCalendarItem => {
//               const { height: prevCalendarItemHeight } =
//                 $prevCalendarItem[0].getBoundingClientRect();
//               const prevCalendarItemMarginBottm = parseInt(
//                 $prevCalendarItem.css('marginBottom'),
//                 10,
//               );

//               const pointerDownPageY = calendarItemActiveTop;
//               const pointerUpPageY = Math.ceil(
//                 calendarItemActiveTop + prevCalendarItemHeight + prevCalendarItemMarginBottm,
//               );

//               cy.get('[data-test=Calendar__wrapper]')
//                 .trigger('pointerdown', {
//                   pageY: pointerDownPageY,
//                 })
//                 .trigger('pointermove', {
//                   pageY: pointerUpPageY,
//                 })
//                 .trigger('pointerup', {
//                   pageY: pointerUpPageY,
//                 });

//               cy.get('[data-test=CalendarItem]').eq(2).should('be.visible');
//             });
//         });
//       });
//     } else {
//       it('User can scroll through milestones by drag&drop horizontally', () => {
//         cy.get('[data-test=LayoutTopBarCalendar]').click();
//         cy.wait(2000);
//         cy.get('[data-test=CalendarItem][data-is-active=true]').then($calendarItemActive => {
//           const { left: calendarItemActiveLeft } = $calendarItemActive[0].getBoundingClientRect();

//           cy.get('[data-test=CalendarItem]').eq(2).should('not.be.visible');
//           cy.get('[data-test=CalendarItem]')
//             .eq(2)
//             .then($prevCalendarItem => {
//               const { width: prevCalendarItemWidth } = $prevCalendarItem[0].getBoundingClientRect();
//               const prevCalendarItemMarginRight = parseInt(
//                 $prevCalendarItem.css('marginRight'),
//                 10,
//               );

//               const pointerDownPageX = calendarItemActiveLeft;
//               const pointerUpPageX = Math.ceil(
//                 calendarItemActiveLeft + prevCalendarItemWidth + prevCalendarItemMarginRight,
//               );

//               cy.get('[data-test=Calendar__wrapper]')
//                 .trigger('pointerdown', {
//                   pageX: pointerDownPageX,
//                 })
//                 .trigger('pointermove', {
//                   pageX: pointerUpPageX,
//                 });

//               cy.get('[data-test=CalendarItem]').eq(2).should('be.visible');
//             });
//         });
//       });
//     }

//     if (isMobile) {
//       it('User can close Calendar by clicking on close button (X) in top-right corner', () => {
//         cy.get('[data-test=LayoutTopBarCalendar]').click();
//         cy.wait(2000);
//         cy.get('[data-test=Calendar]').should('be.visible');
//         cy.get('[data-test=LayoutTopBarCalendar__ModalCalendar__Button]').click();
//         cy.get('[data-test=Calendar]').should('not.exist');
//       });
//     }
//   });
// });

describe('move time - AW IS OPEN - less than 24h to change AW', () => {
  before(() => {
    /**
     * Global Metamask setup done by Synpress is not always done.
     * Since Synpress needs to have valid provider to fetch the data from contracts,
     * setupMetamask is required in each test suite.
     */
    cy.setupMetamask();
  });

  it('allocation window is closed, when it is not, move time', () => {
    setupAndMoveToPlayground();

    cy.window().then(async win => {
      moveTime(win, 'nextEpochDecisionWindowOpen').then(() => {
        cy.get('[data-test=PlaygroundView]').should('be.visible');
        const isDecisionWindowOpenAfter = win.clientReactQuery.getQueryData(
          QUERY_KEYS.isDecisionWindowOpen,
        );
        expect(isDecisionWindowOpenAfter).to.be.true;
      });
    });
  });
});

Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isDesktop, isLargeDesktop }) => {
    describe(`[AW IS OPEN < 24h] Calendar: ${device}`, { viewportHeight, viewportWidth }, () => {
      before(() => {
        cy.clearLocalStorage();
      });

      beforeEach(() => {
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        const now = new Date().getTime() + 283.5 * 24 * 60 * 60 * 1000;
        cy.clock(now, ['Date']);
        visitWithLoader(ROOT.absolute, ROOT_ROUTES.home.absolute);
      });

      it('Allocation window milestone has alert style when AW is going to change in less than 24h', () => {
        cy.get('[data-test=LayoutTopBarCalendar]').click();
        cy.wait(2000);
        cy.get('[data-test=CalendarItem][data-is-active=true]').should('be.visible');
        cy.get('[data-test=CalendarItem][data-is-active=true]')
          .invoke('css', 'opacity')
          .should('eq', '1');
        cy.get('[data-test=CalendarItem][data-is-active=true]')
          .then($el => $el.css('backgroundColor'))
          .should('be.colored', '#fff5f4');
        cy.get('[data-test=CalendarItem][data-is-active=true]').within(() => {
          cy.get('[data-test=CalendarItem__title__day]')
            .then($el => $el.css('color'))
            .should('be.colored', '#ff6157');
          cy.get('[data-test=CalendarItem__title__monthShort]')
            .then($el => $el.css('color'))
            .should('be.colored', '#ff6157');
          cy.get('[data-test=CalendarItem__label]')
            .invoke('text')
            .should('eq', 'Allocation window');
          cy.get('[data-test=CalendarItem__label]')
            .then($el => $el.css('color'))
            .should('be.colored', '#ff6157');
          cy.get('[data-test=CalendarItem__date]')
            .then($el => $el.css('color'))
            .should('be.colored', '#ff6157');
        });
      });

      if (isDesktop || isLargeDesktop) {
        it('Allocation window milestone with alert style shows time to change AW on hover', () => {
          cy.get('[data-test=LayoutTopBarCalendar]').click();
          cy.wait(2000);
          cy.get('[data-test=CalendarItem][data-is-active=true]')
            .realHover()
            .then($el => $el.css('backgroundColor'))
            .should('be.colored', '#ffeae6');
          cy.get('[data-test=CalendarItem][data-is-active=true]')
            .realHover()
            .within(() => {
              cy.get('[data-test=CalendarItem__date]').invoke('text').should('contain', 'hours');
            });
        });
      }
    });
  },
);
