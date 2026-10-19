import { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n/locales';
import type { StorageAccessor } from './language-preference';

/** The two views of a project sheet, in tab order. */
export const VIEWS = ['recruiter', 'lead-dev'] as const;

export type View = (typeof VIEWS)[number];

/** localStorage key holding the view last picked, shared by every sheet. */
export const STORAGE_KEY = 'sheet-view';

/** Attribute set on `<html>` once the view is known: the CSS then shows the matching panel only. */
export const VIEW_ATTRIBUTE = 'data-sheet-view';

/** Attribute of the tabs, holding the view they select. */
export const TAB_ATTRIBUTE = 'data-view-tab';

/** Attribute of the view sections, holding the view they hold. */
export const PANEL_ATTRIBUTE = 'data-view-panel';

/** Query parameter selecting the lead dev view (`?vue=tech`), translated like the URLs. */
export const VIEW_PARAMS: Readonly<Record<Locale, string>> = { fr: 'vue', en: 'view' };

const LEAD_DEV_VALUE = 'tech';

function isView(value: unknown): value is View {
  return typeof value === 'string' && (VIEWS as readonly string[]).includes(value);
}

/** View requested by the URL query string, if any. */
export function viewFromSearch(search: string, locale: Locale): View | null {
  return new URLSearchParams(search).get(VIEW_PARAMS[locale]) === LEAD_DEV_VALUE
    ? 'lead-dev'
    : null;
}

/** Remembered view. Returns null when nothing valid is stored or storage is unavailable. */
export function readView(storage: StorageAccessor): View | null {
  try {
    const value = storage().getItem(STORAGE_KEY);
    return isView(value) ? value : null;
  } catch {
    return null;
  }
}

/** Remembers the view. Silently does nothing when storage is unavailable. */
export function saveView(storage: StorageAccessor, view: View): void {
  try {
    storage().setItem(STORAGE_KEY, view);
  } catch {
    // The choice simply is not remembered.
  }
}

/** View shown on arrival: the URL first, then the remembered choice, then the recruiter view. */
export function initialView(search: string, locale: Locale, storage: StorageAccessor): View {
  return viewFromSearch(search, locale) ?? readView(storage) ?? 'recruiter';
}

/** Same-origin URL of the page showing `view`: the parameter is set for lead dev, removed otherwise. */
export function viewUrl(href: string, view: View, locale: Locale): string {
  const url = new URL(href);
  if (view === 'lead-dev') url.searchParams.set(VIEW_PARAMS[locale], LEAD_DEV_VALUE);
  else url.searchParams.delete(VIEW_PARAMS[locale]);
  return url.pathname + url.search + url.hash;
}

/** View reached from `current` with a tab list key (arrows wrap around), or null for other keys. */
export function keyTarget(key: string, current: View): View | null {
  const index = VIEWS.indexOf(current);
  switch (key) {
    case 'ArrowRight':
      return VIEWS[(index + 1) % VIEWS.length];
    case 'ArrowLeft':
      return VIEWS[(index - 1 + VIEWS.length) % VIEWS.length];
    case 'Home':
      return VIEWS[0];
    case 'End':
      return VIEWS[VIEWS.length - 1];
    default:
      return null;
  }
}

/** Shows `view`: marks the document (the CSS hides the other panel) and selects its tab. */
export function applyView(doc: Document, view: View): void {
  doc.documentElement.setAttribute(VIEW_ATTRIBUTE, view);
  for (const tab of doc.querySelectorAll<HTMLElement>(`[${TAB_ATTRIBUTE}]`)) {
    const selected = tab.getAttribute(TAB_ATTRIBUTE) === view;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
}

/**
 * Gives the view sections their tab panel semantics. Only done with JavaScript:
 * without it, the tabs stay hidden and the sections are plain, stacked sections.
 */
export function enhancePanels(doc: Document): void {
  for (const panel of doc.querySelectorAll<HTMLElement>(`[${PANEL_ATTRIBUTE}]`)) {
    const tab = doc.querySelector(`[${TAB_ATTRIBUTE}="${panel.getAttribute(PANEL_ATTRIBUTE)}"]`);
    if (tab === null) continue;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    // Focusable, as its first content may not be: Tab moves from the tabs to the panel.
    panel.tabIndex = 0;
    tab.setAttribute('aria-controls', panel.id);
  }
}

const tabOf = (target: EventTarget | null) =>
  target instanceof Element ? target.closest<HTMLElement>(`[${TAB_ATTRIBUTE}]`) : null;

/**
 * Picks the view before the first paint, then wires the tabs.
 * Meant to run as a blocking script in the document head of the sheet pages.
 */
export function initSheetView(win: Window): void {
  const doc = win.document;
  const locale = isLocale(doc.documentElement.lang) ? doc.documentElement.lang : DEFAULT_LOCALE;
  const storage: StorageAccessor = () => win.localStorage;
  let current = initialView(win.location.search, locale, storage);

  const show = (view: View) => {
    current = view;
    applyView(doc, view);
    win.history.replaceState(win.history.state, '', viewUrl(win.location.href, view, locale));
  };
  const select = (view: View) => {
    show(view);
    saveView(storage, view);
  };

  show(current);
  doc.addEventListener('DOMContentLoaded', () => {
    enhancePanels(doc);
    applyView(doc, current);
  });
  doc.addEventListener('click', (event) => {
    const view = tabOf(event.target)?.getAttribute(TAB_ATTRIBUTE);
    if (isView(view)) select(view);
  });
  doc.addEventListener('keydown', (event) => {
    if (tabOf(event.target) === null) return;
    const view = keyTarget(event.key, current);
    if (view === null) return;
    event.preventDefault();
    select(view);
    doc.querySelector<HTMLElement>(`[${TAB_ATTRIBUTE}="${view}"]`)?.focus();
  });
}
