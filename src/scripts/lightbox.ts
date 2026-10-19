/**
 * Attribute of the links to a full size image, holding the label of the close button.
 * Without JavaScript they stay plain links; with it, they open the image in a modal dialog.
 */
export const LIGHTBOX_ATTRIBUTE = 'data-lightbox';

/** Modal dialog showing a full size image, created on first use and reused afterwards. */
function lightboxDialog(doc: Document): HTMLDialogElement {
  const existing = doc.querySelector<HTMLDialogElement>('dialog.lightbox');
  if (existing !== null) return existing;

  const dialog = doc.createElement('dialog');
  dialog.className = 'lightbox';
  const close = doc.createElement('button');
  close.type = 'button';
  close.className = 'lightbox-close';
  dialog.append(close, doc.createElement('img'));
  close.addEventListener('click', () => dialog.close());
  // A click on the backdrop (outside the image and the button) closes the dialog.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  doc.body.append(dialog);
  return dialog;
}

/** Opens the image a lightbox link points to. Escape closes it natively, focus returns to the link. */
function open(doc: Document, link: HTMLAnchorElement): void {
  const dialog = lightboxDialog(doc);
  const close = dialog.querySelector('button') as HTMLButtonElement;
  const image = dialog.querySelector('img') as HTMLImageElement;
  close.textContent = link.getAttribute(LIGHTBOX_ATTRIBUTE);
  image.src = link.getAttribute('href') ?? '';
  image.alt = link.querySelector('img')?.alt ?? '';
  // Named after the image, so screen readers announce what the dialog shows.
  dialog.setAttribute('aria-label', image.alt);
  dialog.showModal();
}

/** Makes every lightbox link of the document open its image in a modal dialog. */
export function enhanceLightboxes(doc: Document): void {
  for (const link of doc.querySelectorAll<HTMLAnchorElement>(`a[${LIGHTBOX_ATTRIBUTE}]`)) {
    link.addEventListener('click', (event) => {
      // New tab, new window, download: leave those to the browser.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(doc, link);
    });
  }
}
