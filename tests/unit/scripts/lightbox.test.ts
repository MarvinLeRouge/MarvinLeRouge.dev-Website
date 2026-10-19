// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { enhanceLightboxes, LIGHTBOX_ATTRIBUTE } from '../../../src/scripts/lightbox';

const LINK_HTML = `
  <a href="/full.avif" ${LIGHTBOX_ATTRIBUTE}="Close" aria-describedby="hint">
    <img src="/thumb.png" alt="Main screen">
  </a>
  <p id="hint">See the screenshot at full size</p>
`;

const link = () => document.querySelector('a') as HTMLAnchorElement;
const dialog = () => document.querySelector('dialog') as HTMLDialogElement;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('enhanceLightboxes', () => {
  it('opens the full image in a modal dialog instead of following the link', () => {
    document.body.innerHTML = LINK_HTML;
    enhanceLightboxes(document);

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link().dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(dialog().open).toBe(true);
    const image = dialog().querySelector('img');
    expect(image?.getAttribute('src')).toBe('/full.avif');
    expect(image?.getAttribute('alt')).toBe('Main screen');
    expect(dialog().getAttribute('aria-label')).toBe('Main screen');
  });

  it('closes the dialog with its labelled close button', () => {
    document.body.innerHTML = LINK_HTML;
    enhanceLightboxes(document);
    link().click();

    const close = dialog().querySelector('button') as HTMLButtonElement;
    expect(close.textContent).toBe('Close');
    close.click();

    expect(dialog().open).toBe(false);
  });

  it('closes the dialog on a click outside the image', () => {
    document.body.innerHTML = LINK_HTML;
    enhanceLightboxes(document);
    link().click();

    dialog().dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(dialog().open).toBe(false);
  });

  it('keeps the dialog open on a click on the image itself', () => {
    document.body.innerHTML = LINK_HTML;
    enhanceLightboxes(document);
    link().click();

    dialog()
      .querySelector('img')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(dialog().open).toBe(true);
  });

  it.each(['ctrlKey', 'metaKey', 'shiftKey', 'altKey'])(
    'lets a click with %s open the image as a plain link',
    (modifier) => {
      document.body.innerHTML = LINK_HTML;
      enhanceLightboxes(document);

      const event = new MouseEvent('click', { bubbles: true, cancelable: true, [modifier]: true });
      link().dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
      expect(document.querySelector('dialog')).toBeNull();
    },
  );

  it('reuses a single dialog across openings', () => {
    document.body.innerHTML = LINK_HTML;
    enhanceLightboxes(document);
    link().click();
    (dialog().querySelector('button') as HTMLButtonElement).click();
    link().click();

    expect(document.querySelectorAll('dialog')).toHaveLength(1);
  });
});
