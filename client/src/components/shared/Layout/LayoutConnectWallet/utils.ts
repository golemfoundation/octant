import { TFunction } from 'i18next';

export const setCustomStylesForRainbowKitModal = (t: TFunction): void => {
  // RaibowKit connect modal.
  const rainbowkitConnectModal = document.querySelectorAll('body > div')[4];

  const allChildren = rainbowkitConnectModal.querySelectorAll('*');
  // font-family is set for all children, as inherited !important doesn't work here.
  allChildren.forEach(element => {
    // eslint-disable-next-line no-param-reassign
    element.classList.add('rainbowKitCustomFontFamily');
  });

  // Wrapper that sets the width.
  const modalWidth = document.querySelector(
    '.iekbcc0._1ckjpok4._1ckjpok1.ju367vb6.ju367vdr.ju367vp.ju367vt.ju367vv.ju367vel.ju367va.ju367v15.ju367v6c.ju367v8r',
  );
  modalWidth?.classList.add('modalWidth');

  // Primary content wrapper to set the padding.
  const primaryWrapper = document.querySelector('.iekbcc0.ju367va.ju367v15.ju367v4y._1vwt0cg4');
  primaryWrapper?.classList.add('primaryWrapper');

  // Header.
  const modalHeader = document.querySelector('.iekbcc0.ju367va.ju367v2r');
  modalHeader?.classList.add('modalHeader');

  // Dummy div in the header. Causes problems with the flexbox, display none.
  const dummyDiv = document.querySelector('.iekbcc0.ju367v3s.ju367v94');
  dummyDiv?.classList.add('dummyDiv');

  // Wrapper for the text in the header.
  const headerTextWrapper = document.querySelector(
    '.iekbcc0.ju367v7a.ju367v7v.ju367v3h.ju367v6k.ju367v86',
  );
  headerTextWrapper?.classList.add('headerTextWrapper');

  // Text in the header.
  const headerText = modalHeader?.querySelector('div:nth-child(2) > h1');
  headerText?.classList.add('headerText');

  if (headerText) {
    headerText.textContent = t('walletSelectHeader');
  }

  const optionsWrapper = document.querySelector('.iekbcc0.ju367v6p._1vwt0cg2.ju367v7a.ju367v7v');
  optionsWrapper?.classList.add('optionsWrapper');

  const walletOptionsButtonsWrappers = document.querySelectorAll(
    '.iekbcc0.ju367va.ju367v15.ju367v1n',
  );
  walletOptionsButtonsWrappers.forEach(element => {
    element?.classList.add('walletOptionsButtonsWrapper');
  });

  const walletOptionsButtons = document.querySelectorAll('.iekbcc0.ju367va.ju367v15.ju367v1n');
  walletOptionsButtons.forEach(element => {
    element.classList.add('walletOptionsButtons');
  });

  const walletOptionsButtonsOuter = document.querySelectorAll('.iekbcc0.ju367va.ju367v15');
  walletOptionsButtonsOuter.forEach(element => {
    element.classList.add('walletOptionsButtonsOuter');
  });

  const walletOptionsButtonsContent = document.querySelectorAll(
    '.iekbcc0.iekbcc9.ju367v89.ju367v6i.ju367v73.ju367v7o.ju367vo.ju367vt.ju367vv.ju367v8u.ju367v9f.ju367vb1.g5kl0l0._12cbo8i3.ju367v8r._12cbo8i6',
  );
  walletOptionsButtonsContent.forEach(element => {
    element.classList.add('walletOptionsButtonsContent');
  });

  const walletOptionsContents = document.querySelectorAll(
    '.iekbcc0.ju367v4.ju367va.ju367v14.ju367v1s',
  );
  walletOptionsContents.forEach(element => {
    element?.classList.add('walletOptionsContent');
  });

  const walletOptionsText = document.querySelectorAll('.iekbcc0.ju367v5p');
  walletOptionsText.forEach(element => {
    element.classList.add('walletOptionsText');
  });

  const buttonClose = document.querySelectorAll(
    '.iekbcc0.iekbcc9.ju367v4.ju367va0.ju367vc6.ju367vs.ju367vt.ju367vv.ju367vff.ju367va.ju367v2b.ju367v2q.ju367v8u.ju367v94._12cbo8i3.ju367v8r._12cbo8i5._12cbo8i7',
  )[0];

  buttonClose.classList.add('buttonClose');

  const walletOptionsIcons = document.querySelectorAll('.iekbcc0.ju367v2m.ju367v8p.ju367v9f');
  walletOptionsIcons.forEach(element => {
    element.classList.add('walletOptionsIcons');
  });

  // Installed, recommended.
  const sectionHeaders = document.querySelectorAll('.iekbcc0.ju367v3n.ju367v48.ju367v33.ju367v4y');
  sectionHeaders.forEach(element => {
    element.classList.add('sectionHeaders');
  });

  const walletSections = document.querySelectorAll('.iekbcc0.ju367va.ju367v15.ju367v1n');
  if (walletSections) {
    walletSections[1].classList.add('walletSections');
  }

  const linkBoxTopDividerLine = document.querySelector('.iekbcc0.ju367vau.ju367v24.ju367v57');
  linkBoxTopDividerLine?.classList.add('linkBoxTopDividerLine');

  // Div with "new to ethereum" text + link.
  const linkBox = document.querySelector(
    '.iekbcc0.ju367v7c.ju367v7x.ju367v8f.ju367v6o.ju367v4.ju367va.ju367v2r',
  );
  linkBox?.classList.add('linkBox');
};
