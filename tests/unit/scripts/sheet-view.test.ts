// @vitest-environment happy-dom
import { Window as HappyWindow } from 'happy-dom';
import { afterEach, describe, expect, it } from 'vitest';
import {
  applyView,
  enhancePanels,
  initialView,
  initSheetView,
  keyTarget,
  PANEL_ATTRIBUTE,
  readView,
  saveView,
  STORAGE_KEY,
  TAB_ATTRIBUTE,
  VIEW_ATTRIBUTE,
  viewFromSearch,
  viewUrl,
} from '../../../src/scripts/sheet-view';

const storage = () => localStorage;
const blockedStorage = () => {
  throw new DOMException('site data blocked', 'SecurityError');
};

const SHEET_HTML = `
  <div role="tablist">
    <button type="button" role="tab" id="tab-recruiter" ${TAB_ATTRIBUTE}="recruiter">Recruiter</button>
    <button type="button" role="tab" id="tab-lead-dev" ${TAB_ATTRIBUTE}="lead-dev">Lead dev</button>
  </div>
  <section id="view-recruiter" ${PANEL_ATTRIBUTE}="recruiter" aria-labelledby="recruiter-title"></section>
  <section id="view-lead-dev" ${PANEL_ATTRIBUTE}="lead-dev" aria-labelledby="lead-dev-title"></section>
`;

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute(VIEW_ATTRIBUTE);
  document.documentElement.removeAttribute('lang');
});

describe('viewFromSearch', () => {
  it('reads the lead dev view from the translated parameter', () => {
    expect(viewFromSearch('?vue=tech', 'fr')).toBe('lead-dev');
    expect(viewFromSearch('?view=tech', 'en')).toBe('lead-dev');
  });

  it('ignores the parameter of the other language and unknown values', () => {
    expect(viewFromSearch('?view=tech', 'fr')).toBeNull();
    expect(viewFromSearch('?vue=other', 'fr')).toBeNull();
    expect(viewFromSearch('', 'fr')).toBeNull();
  });
});

describe('readView and saveView', () => {
  it('remembers the chosen view', () => {
    saveView(storage, 'lead-dev');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('lead-dev');
    expect(readView(storage)).toBe('lead-dev');
  });

  it('ignores an unknown stored value', () => {
    localStorage.setItem(STORAGE_KEY, 'manager');
    expect(readView(storage)).toBeNull();
  });

  it('works without storage', () => {
    expect(() => saveView(blockedStorage, 'lead-dev')).not.toThrow();
    expect(readView(blockedStorage)).toBeNull();
  });
});

describe('initialView', () => {
  it('prefers the URL, then the remembered choice, then the recruiter view', () => {
    saveView(storage, 'lead-dev');
    expect(initialView('?vue=tech', 'fr', storage)).toBe('lead-dev');
    expect(initialView('', 'fr', storage)).toBe('lead-dev');
    localStorage.clear();
    expect(initialView('', 'fr', storage)).toBe('recruiter');
  });
});

describe('viewUrl', () => {
  it('adds the parameter for the lead dev view, keeping the rest of the URL', () => {
    expect(viewUrl('https://site.test/projets/a/?x=1#top', 'lead-dev', 'fr')).toBe(
      '/projets/a/?x=1&vue=tech#top',
    );
  });

  it('removes the parameter for the recruiter view', () => {
    expect(viewUrl('https://site.test/en/projects/a/?view=tech', 'recruiter', 'en')).toBe(
      '/en/projects/a/',
    );
  });
});

describe('keyTarget', () => {
  it('moves between the two views with the arrow, Home and End keys', () => {
    expect(keyTarget('ArrowRight', 'recruiter')).toBe('lead-dev');
    expect(keyTarget('ArrowRight', 'lead-dev')).toBe('recruiter');
    expect(keyTarget('ArrowLeft', 'recruiter')).toBe('lead-dev');
    expect(keyTarget('Home', 'lead-dev')).toBe('recruiter');
    expect(keyTarget('End', 'recruiter')).toBe('lead-dev');
  });

  it('ignores other keys', () => {
    expect(keyTarget('Enter', 'recruiter')).toBeNull();
  });
});

describe('applyView', () => {
  it('marks the document and selects the matching tab only', () => {
    document.body.innerHTML = SHEET_HTML;

    applyView(document, 'lead-dev');

    expect(document.documentElement.getAttribute(VIEW_ATTRIBUTE)).toBe('lead-dev');
    const [recruiter, leadDev] = document.querySelectorAll<HTMLElement>('[role="tab"]');
    expect(recruiter.getAttribute('aria-selected')).toBe('false');
    expect(recruiter.tabIndex).toBe(-1);
    expect(leadDev.getAttribute('aria-selected')).toBe('true');
    expect(leadDev.tabIndex).toBe(0);
  });
});

describe('enhancePanels', () => {
  it('turns the view sections into tab panels labelled by their tab', () => {
    document.body.innerHTML = SHEET_HTML;

    enhancePanels(document);

    const panel = document.getElementById('view-lead-dev');
    expect(panel?.getAttribute('role')).toBe('tabpanel');
    expect(panel?.getAttribute('aria-labelledby')).toBe('tab-lead-dev');
    expect(panel?.tabIndex).toBe(0);
    expect(document.getElementById('tab-lead-dev')?.getAttribute('aria-controls')).toBe(
      'view-lead-dev',
    );
  });
});

describe('initSheetView', () => {
  // A fresh window per test: the listeners of a previous test must not answer.
  const open = (url: string, stored?: string) => {
    const win = new HappyWindow({ url: `https://site.test${url}` }) as unknown as Window;
    if (stored) win.localStorage.setItem(STORAGE_KEY, stored);
    win.document.documentElement.lang = url.startsWith('/en/') ? 'en' : 'fr';
    return win;
  };
  const load = (win: Window) => {
    initSheetView(win);
    win.document.body.innerHTML = SHEET_HTML;
    win.document.dispatchEvent(new Event('DOMContentLoaded'));
  };
  const tab = (win: Window, view: string) =>
    win.document.querySelector(`[${TAB_ATTRIBUTE}="${view}"]`) as HTMLElement;
  const shownView = (win: Window) => win.document.documentElement.getAttribute(VIEW_ATTRIBUTE);

  it('shows the view of the URL before the page renders, without remembering it', () => {
    const win = open('/projets/a/?vue=tech');

    initSheetView(win);

    expect(shownView(win)).toBe('lead-dev');
    expect(win.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('reflects a remembered view in the URL', () => {
    const win = open('/en/projects/a/', 'lead-dev');

    load(win);

    expect(win.location.search).toBe('?view=tech');
    expect(tab(win, 'lead-dev').getAttribute('aria-selected')).toBe('true');
  });

  it('switches view on click, updating the URL and the remembered choice', () => {
    const win = open('/projets/a/');
    load(win);

    tab(win, 'lead-dev').click();

    expect(shownView(win)).toBe('lead-dev');
    expect(win.location.search).toBe('?vue=tech');
    expect(win.localStorage.getItem(STORAGE_KEY)).toBe('lead-dev');
  });

  it('switches view and moves the focus with the keyboard', () => {
    const win = open('/projets/a/');
    load(win);

    tab(win, 'recruiter').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );

    expect(shownView(win)).toBe('lead-dev');
    expect(win.document.activeElement).toBe(tab(win, 'lead-dev'));
  });

  it('ignores clicks and keys outside the tabs', () => {
    const win = open('/projets/a/');
    load(win);

    win.document.body.click();
    win.document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));

    expect(shownView(win)).toBe('recruiter');
  });
});
