import { ELEMENT_POSITION_FIXED_CLASSNAME } from 'constants/css';

let scrollbarWidth: number | undefined;
let scrollTop: number | undefined;

const getElementsWithPositionFixed = (): HTMLElement[] => {
  return [...document.getElementsByClassName(ELEMENT_POSITION_FIXED_CLASSNAME)] as HTMLElement[];
};

const getElementsWithOverflowHidden = (): HTMLElement[] => {
  return [document.body];
};

const closeModal = async (
  elementsOverflowHidden: HTMLElement[],
  elementWithPositionFixed: HTMLElement[],
  durationOfClosing: number,
): Promise<void> => {
  const promise = new Promise<void>(resolve => {
    setTimeout(() => {
      document.body.classList.remove('bodyFixed');
      document.body.style.overflowY = 'scroll';
      document.body.style.paddingRight = '0';

      elementsOverflowHidden.forEach(element => {
        // eslint-disable-next-line no-param-reassign
        element.style.overflowY = 'initial';
      });
      elementWithPositionFixed.forEach(element => {
        // eslint-disable-next-line no-param-reassign
        element.style.paddingRight = '0';
        element.classList.remove('isScrollbarOffsetEnabled');
      });
      resolve();
    }, durationOfClosing);
  });
  await promise.then(() => {
    if (scrollTop) {
      document.documentElement.scrollTop = scrollTop;
    }
    scrollbarWidth = undefined;
  });
};

const openModal = (
  elementsOverflowHidden: HTMLElement[],
  elementWithPositionFixed: HTMLElement[],
) => {
  /**
   * Overflow hidden is added to prevent scrolling of the body while modal is open.
   * Scrollbar width is added as padding to offset modal's disappearance.
   */
  scrollTop = document.documentElement.scrollTop;
  document.body.style.setProperty('--st', `${-scrollTop}px`);
  document.body.style.overflowY = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`;
  document.body.classList.add('bodyFixed');
  elementsOverflowHidden.forEach(element => {
    // eslint-disable-next-line no-param-reassign
    element.style.overflowY = 'hidden';
  });
  elementWithPositionFixed.forEach(element => {
    // eslint-disable-next-line no-param-reassign
    element.style.paddingRight = `${scrollbarWidth}px`;
    element.classList.add('isScrollbarOffsetEnabled');
  });
};

export default function setDocumentOverflowModal(isOpen: boolean, durationOfClosing: number): void {
  /**
   * scrollbarWidth needs to be set once.
   * When it's not, following scenario happens:
   * 1. Open a modal on desktop (or mobile).
   * 2. Change the width of the view to the other (desktop => mobile / mobile => desktop).
   * 3. Close the modal.
   * 4. ELEMENT_POSITION_FIXED_CLASSNAME elements move to the left/right.
   *
   * It happens because setDocumentOverflowModal is triggered
   * with isOpen === true during change between mobile/desktop.
   * When it happens, since scrollbar is hidden, its width is 0, causing padding offsetting
   * the scrollbar to disappear.
   *
   * Scenarios to test for both Modal and InputSelect components:
   * 1. Open on desktop, close the on desktop.
   * 2. Open on mobile/tablet, close on mobile/tablet.
   * 3. Open on desktop, change the viewport to mobile/tablet, close.
   * 4. Open on mobile/tablet, change the viewport to desktop, close.
   * In each scenario neither modal, body nor ELEMENT_POSITION_FIXED_CLASSNAME elements should move
   * during open/close of the modal.
   */
  if (scrollbarWidth === undefined) {
    const documentWidth = document.documentElement.clientWidth;
    const windowWidth = window.innerWidth;
    scrollbarWidth = windowWidth - documentWidth;
  }

  const elementWithPositionFixed = getElementsWithPositionFixed();
  const elementsOverflowHidden = getElementsWithOverflowHidden();

  if (!isOpen) {
    closeModal(elementsOverflowHidden, elementWithPositionFixed, durationOfClosing);
    return;
  }
  openModal(elementsOverflowHidden, elementWithPositionFixed);
}
