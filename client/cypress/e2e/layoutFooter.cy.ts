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

// describe('AW IS CLOSED: move time', () => {
//   before(() => {
//     /**
//      * Global Metamask setup done by Synpress is not always done.
//      * Since Synpress needs to have valid provider to fetch the data from contracts,
//      * setupMetamask is required in each test suite.
//      */
//     cy.setupMetamask();
//   });

//   it('allocation window is closed, when it is not, move time', () => {
//     setupAndMoveToPlayground();

//     cy.window().then(async win => {
//       moveTime(win, 'nextEpochDecisionWindowClosed').then(() => {
//         cy.get('[data-test=PlaygroundView]').should('be.visible');
//         const isDecisionWindowOpenAfter = win.clientReactQuery.getQueryData(
//           QUERY_KEYS.isDecisionWindowOpen,
//         );
//         expect(isDecisionWindowOpenAfter).to.be.false;
//       });
//     });
//   });
// });

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`[AW IS CLOSED] LayoutFooter: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      cy.clearLocalStorage();
      window.isTestnetCypress = false;
    });

    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT.absolute, ROOT_ROUTES.home.absolute);
    });

    it('Footer is visible', () => {
      cy.get('[data-test=LayoutFooter]').should('be.visible');
    });

    it('Octant logo is visible', () => {
      cy.get('[data-test=LayoutFooter__Logo]').should('be.visible');
    });

    it('Project info text is visible and has correct text', () => {
      cy.get('[data-test=LayoutFooter__projectInfoText]').should('be.visible');
      cy.get('[data-test=LayoutFooter__projectInfoText]')
        .invoke('text')
        .should('eq', 'Octant is a Golem Foundation project, launched in 2023.');
    });

    it('Project info text has link to the Golem Foundation website', () => {
      cy.get('[data-test=LayoutFooter__projectInfoText__link]').should('be.visible');
      cy.get('[data-test=LayoutFooter__projectInfoText__link]')
        .invoke('text')
        .should('eq', 'Golem Foundation');
      cy.get('[data-test=LayoutFooter__projectInfoText__link]')
        .invoke('attr', 'href')
        .should('eq', 'https://golem.foundation/');
      cy.get('[data-test=LayoutFooter__projectInfoText__link]')
        .invoke('attr', 'target')
        .should('eq', '_blank');
    });

    it('Website link is visible, has correct text and attributes', () => {
      cy.get('[data-test=LayoutFooter__link--website]').should('be.visible');
      cy.get('[data-test=LayoutFooter__link--website]').invoke('text').should('eq', '→ Website');
      cy.get('[data-test=LayoutFooter__link--website]')
        .invoke('attr', 'href')
        .should('eq', 'https://octant.build/');
      cy.get('[data-test=LayoutFooter__link--website]')
        .invoke('attr', 'target')
        .should('eq', '_blank');
    });

    it('Docs link is visible, has correct text and attributes', () => {
      cy.get('[data-test=LayoutFooter__link--docs]').should('be.visible');
      cy.get('[data-test=LayoutFooter__link--docs]').invoke('text').should('eq', '→ Docs');
      cy.get('[data-test=LayoutFooter__link--docs]')
        .invoke('attr', 'href')
        .should('eq', 'https://docs.octant.app/');
      cy.get('[data-test=LayoutFooter__link--docs]')
        .invoke('attr', 'target')
        .should('eq', '_blank');
    });

    it('Discord link is visible, has correct text and attributes', () => {
      cy.get('[data-test=LayoutFooter__link--discord]').should('be.visible');
      cy.get('[data-test=LayoutFooter__link--discord]').invoke('text').should('eq', '→ Discord');
      cy.get('[data-test=LayoutFooter__link--discord]')
        .invoke('attr', 'href')
        .should('eq', 'https://discord.gg/octant');
      cy.get('[data-test=LayoutFooter__link--discord]')
        .invoke('attr', 'target')
        .should('eq', '_blank');
    });

    it('Farcaster link is visible, has correct text and attributes', () => {
      cy.get('[data-test=LayoutFooter__link--farcaster]').should('be.visible');
      cy.get('[data-test=LayoutFooter__link--farcaster]')
        .invoke('text')
        .should('eq', '→ Farcaster');
      cy.get('[data-test=LayoutFooter__link--farcaster]')
        .invoke('attr', 'href')
        .should('eq', 'https://warpcast.com/octant');
      cy.get('[data-test=LayoutFooter__link--farcaster]')
        .invoke('attr', 'target')
        .should('eq', '_blank');
    });

    it('Privacy policy link is visible, has correct text and attributes', () => {
      cy.get('[data-test=LayoutFooter__link--privacyPolicy]').should('be.visible');
      cy.get('[data-test=LayoutFooter__link--privacyPolicy]')
        .invoke('text')
        .should('eq', '→ Privacy policy');
      cy.get('[data-test=LayoutFooter__link--privacyPolicy]')
        .invoke('attr', 'href')
        .should('eq', 'https://docs.octant.app/privacy-policy.html');
      cy.get('[data-test=LayoutFooter__link--privacyPolicy]')
        .invoke('attr', 'target')
        .should('eq', '_blank');
    });

    it('Terms of use link is visible, has correct text and attributes', () => {
      cy.get('[data-test=LayoutFooter__link--termsOfUse]').should('be.visible');
      cy.get('[data-test=LayoutFooter__link--termsOfUse]')
        .invoke('text')
        .should('eq', '→ Terms of use');
      cy.get('[data-test=LayoutFooter__link--termsOfUse]')
        .invoke('attr', 'href')
        .should('eq', 'https://docs.octant.app/terms-of-use.html');
      cy.get('[data-test=LayoutFooter__link--termsOfUse]')
        .invoke('attr', 'target')
        .should('eq', '_blank');
    });

    // it('Newsletter input is visible', () => {
    //   cy.get('[data-test=LayoutFooter__newsletter]').should('be.visible');
    //   cy.get('[data-test=LayoutFooter__newsletter]').children().should('have.length', 2);
    //   cy.get('[data-test=LayoutFooter__newsletter]').within(() => {
    //     cy.get('.gh-signup-root').should('be.visible');
    //   });
    // });

    it('Newsletter text is visible and has correct value', () => {
      cy.get('[data-test=LayoutFooter__newsletterText]').should('be.visible');
      cy.get('[data-test=LayoutFooter__newsletterText]')
        .invoke('text')
        .should('eq', 'Get PGF news and updates from Octant. No spam, ever');
    });

    if (device === 'desktop' || device === 'large-desktop') {
      it('Blog of use link is visible, has correct text and attributes', () => {
        cy.get('[data-test=LayoutFooter__link--blog]').should('be.visible');
        cy.get('[data-test=LayoutFooter__link--blog]').invoke('text').should('eq', '→ Blog');
        cy.get('[data-test=LayoutFooter__link--blog]')
          .invoke('attr', 'href')
          .should('eq', 'https://blog.octant.build/');
        cy.get('[data-test=LayoutFooter__link--blog]')
          .invoke('attr', 'target')
          .should('eq', '_blank');
      });

      it('Terms of use link is visible, has correct text and attributes', () => {
        cy.get('[data-test=LayoutFooter__link--brandAssets]').should('be.visible');
        cy.get('[data-test=LayoutFooter__link--brandAssets]')
          .invoke('text')
          .should('eq', '→ Brand assets');
        cy.get('[data-test=LayoutFooter__link--brandAssets]')
          .invoke('attr', 'href')
          .should(
            'eq',
            'https://www.figma.com/community/file/1295533951881708349/octant-brand-assets',
          );
        cy.get('[data-test=LayoutFooter__link--brandAssets]')
          .invoke('attr', 'target')
          .should('eq', '_blank');
      });
    } else {
      it('Blog of use link doesn`t exist', () => {
        cy.get('[data-test=LayoutFooter__link--blog]').should('not.exist');
      });

      it('Terms of use link doesn`t exist', () => {
        cy.get('[data-test=LayoutFooter__link--brandAssets]').should('not.exist');
      });
    }
  });
});
