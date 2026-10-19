import { describe, expect, it } from 'vitest';
import {
  sheetLocale,
  sheetPath,
  sheetRoutes,
  sheetSlug,
  translationOf,
  visibleSheets,
} from '../../../src/content/projects';

const entry = (id: string, order: number, draft = false) => ({ id, data: { order, draft } });

const entries = [
  entry('fr/beta', 2),
  entry('en/beta', 2),
  entry('fr/alpha', 1),
  entry('fr/draft', 3, true),
  entry('en/alpha', 1),
];

describe('sheet ids', () => {
  it('reads the locale and the slug from the entry id', () => {
    expect(sheetLocale('fr/alpha')).toBe('fr');
    expect(sheetLocale('en/alpha')).toBe('en');
    expect(sheetSlug('en/alpha')).toBe('alpha');
  });

  it('rejects an entry outside a locale folder', () => {
    expect(() => sheetLocale('de/alpha')).toThrow('de/alpha');
    expect(() => sheetLocale('alpha')).toThrow('alpha');
  });
});

describe('sheetPath', () => {
  it('builds the localized sheet URL', () => {
    expect(sheetPath('fr', 'alpha')).toBe('/projets/alpha/');
    expect(sheetPath('en', 'alpha')).toBe('/en/projects/alpha/');
  });
});

describe('visibleSheets', () => {
  it('keeps the published sheets of a locale, in display order', () => {
    expect(visibleSheets(entries, 'fr', false).map((sheet) => sheet.id)).toEqual([
      'fr/alpha',
      'fr/beta',
    ]);
  });

  it('includes drafts when asked, for review in development', () => {
    expect(visibleSheets(entries, 'fr', true).map((sheet) => sheet.id)).toEqual([
      'fr/alpha',
      'fr/beta',
      'fr/draft',
    ]);
  });
});

describe('translationOf', () => {
  it('finds the same sheet in another locale', () => {
    expect(translationOf(entries, entries[0], 'en')).toBe(entries[1]);
  });

  it('returns undefined when the sheet is not translated', () => {
    expect(translationOf(entries, entries[3], 'en')).toBeUndefined();
  });
});

describe('sheetRoutes', () => {
  it('routes each visible sheet of a locale, with its translations when complete', () => {
    const routes = sheetRoutes(entries, 'fr', false);

    expect(routes.map((route) => route.params.slug)).toEqual(['alpha', 'beta']);
    expect(routes[0].props).toEqual({
      sheet: entries[2],
      translations: { fr: '/projets/alpha/', en: '/en/projects/alpha/' },
    });
  });

  it('omits the translations of a sheet missing in a locale', () => {
    const routes = sheetRoutes(entries, 'fr', true);

    expect(routes.at(-1)?.props).toEqual({ sheet: entries[3], translations: undefined });
  });

  it('ignores a translation that is still a draft', () => {
    const withDraftTranslation = [entry('fr/gamma', 4), entry('en/gamma', 4, true)];

    expect(sheetRoutes(withDraftTranslation, 'fr', false)[0].props.translations).toBeUndefined();
  });
});
