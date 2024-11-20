// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { connectWallet, visitWithLoader } from 'cypress/utils/e2e';
import { beforeSetup } from 'cypress/utils/onboarding';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`[AW IS CLOSED] Connect wallet: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      beforeSetup();
      cy.clearLocalStorage();
    });

    beforeEach(() => {
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT.absolute, ROOT_ROUTES.home.absolute);
    });

    after(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    it('Connect wallet button opens Connect wallet Modal', () => {
      cy.get('[data-test=LayoutTopBar__Button]').click();
      cy.wait(500);
      cy.get('[data-test=ModalLayoutConnectWallet]').should('be.visible');
    });

    it('Close button in top-right corner is visible and closes Connect wallet Modal when clicked', () => {
      cy.get('[data-test=LayoutTopBar__Button]').click();
      cy.wait(500);
      cy.get('[data-test=ModalLayoutConnectWallet__Button]').should('be.visible');
      cy.get('[data-test=ModalLayoutConnectWallet__Button]').click();
      cy.wait(500);
      cy.get('[data-test=ModalLayoutConnectWallet]').should('not.exist');
    });

    it('Connect wallet Modal has overflow which closes Connect wallet Modal when clicked', () => {
      cy.get('[data-test=LayoutTopBar__Button]').click();
      cy.wait(500);
      cy.get('[data-test=ModalLayoutConnectWallet__overflow]').should('be.visible');
      cy.get('[data-test=ModalLayoutConnectWallet__overflow]').click();
      cy.wait(500);
      cy.get('[data-test=ModalLayoutConnectWallet]').should('not.exist');
    });

    it('Connect wallet Modal shows "WalletConnect" and "Browser wallet" options when wallet with "injected" id is detected.', () => {
      cy.get('[data-test=LayoutTopBar__Button]').click();
      cy.wait(500);
      cy.get('[data-test=ConnectWallet__BoxRounded--browserWallet]').should('be.visible');
      cy.get('[data-test=ConnectWallet__BoxRounded--walletConnect]').should('be.visible');
    });

    it('Clicking on "WalletConnect" option, opens WalletConnect modal', () => {
      cy.get('[data-test=LayoutTopBar__Button]').click();
      cy.wait(500);
      cy.get('[data-test=ConnectWallet__BoxRounded--walletConnect]').click();
    });

    it('Clicking on "Browser wallet" option connects with MetaMask wallet', () => {
      connectWallet({ isPatronModeEnabled: false });
      cy.get('[data-test=LayoutTopBar__Button]').should('contain.text', '0x');
    });
  });
});
