// TODO: https://linear.app/golemfoundation/issue/OCT-1891/e2e-layout
// import { navigationTabs } from 'src/constants/navigationTabs/navigationTabs';

import {
  navigateWithCheck,
  mockCoinPricesServer,
  connectWallet,
  visitWithLoader,
} from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`layout: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      cy.clearLocalStorage();
      cy.setupMetamask();
    });

    beforeEach(() => {
      mockCoinPricesServer();
      cy.disconnectMetamaskWalletFromAllDapps();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT.absolute, ROOT_ROUTES.projects.absolute);
    });

    after(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    it('renders top bar', () => {
      cy.get('[data-test=MainLayout__Header]').should('be.visible');
    });

    it('Clicking on Octant logo scrolls view to the top on logo click (projects view)', () => {
      cy.scrollTo(0, 500);
      cy.get('[data-test=MainLayout__Logo]').click();
      // waiting for scrolling to finish
      cy.wait(2000);
      cy.window().then(cyWindow => {
        expect(cyWindow.scrollY).to.be.eq(0);
      });
    });

    it('Clicking on Octant logo redirects to projects view (outside projects view)', () => {
      navigateWithCheck(ROOT_ROUTES.settings.absolute);
      cy.get('[data-test=SettingsView]').should('be.visible');
      cy.get('[data-test=MainLayout__Logo]').click();
      cy.get('[data-test=ProjectsView]').should('be.visible');
    });

    it('Clicking on Octant logo redirects to projects view (outside projects view) with memorized scrollY', () => {
      cy.scrollTo(0, 500);
      navigateWithCheck(ROOT_ROUTES.settings.absolute);
      cy.get('[data-test=SettingsView]').should('be.visible');
      cy.get('[data-test=MainLayout__Logo]').click();
      cy.get('[data-test=ProjectsView]').should('be.visible');
      cy.window().then(cyWindow => {
        expect(cyWindow.scrollY).to.be.eq(500);
      });
    });

    it('renders bottom navbar', () => {
      cy.get('[data-test=Navbar]').should('be.visible');
    });

    // TODO: https://linear.app/golemfoundation/issue/OCT-1891/e2e-layout
    // it('bottom navbar allows to change views', () => {
    //   navigationTabs.forEach(({ to }) => {
    //     navigateWithCheck(to);
    //   });
    // });

    it('"Connect" button is visible when wallet is disconnected', () => {
      cy.get('[data-test=MainLayout__Button--connect]').should('be.visible');
      cy.get('[data-test=MainLayout__Button--connect]').click();
    });

    it('"Connect" button opens "ModalConnectWallet"', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet]').should('be.visible');
    });

    it('"ModalConnectWallet" always shows "WalletConnect" option', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet]').within(() => {
        cy.get('[data-test=ConnectWallet__BoxRounded--walletConnect]').should('be.visible');
      });
    });

    it('"ModalConnectWallet" shows "Browser wallet" and "WalletConnect" options (MetaMask wallet detected)', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet]').within(() => {
        cy.get('[data-test=ConnectWallet__BoxRounded--walletConnect]').should('be.visible');
        cy.get('[data-test=ConnectWallet__BoxRounded--browserWallet]').should('be.visible');
      });
    });

    it('"ModalConnectWallet" has overflow enabled', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet__overflow]').should('exist');
    });

    it('Clicking background when "ModalConnectWallet" is open, closes Modal', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet__overflow]').click({ force: true });
      cy.get('[data-test=ModalConnectWallet]').should('not.exist');
    });

    it('"ModalConnectWallet" has "cross" icon button in header', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet__Button]').should('be.visible');
    });

    it('Clicking on "X" mark in "ModalConnectWallet", closes Modal', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet__Button]').click();
      cy.get('[data-test=ModalConnectWallet]').should('not.exist');
    });

    // eslint-disable-next-line no-only-tests/no-only-tests
    it('Clicking on "WalletConnect" option, opens WalletConnect modal', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      // Wait for RainbowKit to load WalletConnect.
      cy.wait(2000);
      cy.get('[data-test=ConnectWallet__BoxRounded--walletConnect]').click();
      cy.get('div:contains("Need the WalletConnect modal?")').should('be.visible');
    });

    it('Clicking on "Browser wallet" option connects with MetaMask wallet', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ConnectWallet__BoxRounded--browserWallet]').click();
      cy.switchToMetamaskNotification();
      cy.acceptMetamaskAccess();
      cy.get('[data-test=MainLayout__Button--connect]').should('not.exist');
      cy.get('[data-test=ProfileInfo]').should('exist');
    });

    it('Wallet address is clickable and has href attribute', () => {
      connectWallet({ isPatronModeEnabled: false, isTOSAccepted: true });
      cy.get('[data-test=ProfileInfo]').click();
      cy.get('[data-test=LayoutWallet__Button--address]').should('be.visible');
      cy.get('[data-test=LayoutWallet__Button--address]').should('have.attr', 'href');
      cy.get('[data-test=LayoutWallet__Button--address]').click();
    });
  });
});
