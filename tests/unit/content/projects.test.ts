import { describe, expect, it } from 'vitest';
import {
  assertTranslated,
  assertUniqueOrder,
  indexPath,
  indexRoutes,
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

  it('omits the translations of a draft missing in a locale', () => {
    const routes = sheetRoutes(entries, 'fr', true);

    expect(routes.at(-1)?.props).toEqual({ sheet: entries[3], translations: undefined });
  });

  it('links translations only between visible sheets, in development too', () => {
    const draftPair = [entry('fr/gamma', 4, true), entry('en/gamma', 4, true)];

    expect(sheetRoutes(draftPair, 'fr', true)[0].props.translations).toEqual({
      fr: '/projets/gamma/',
      en: '/en/projects/gamma/',
    });
  });
});

describe('indexPath', () => {
  it('builds the localized projects index URL', () => {
    expect(indexPath('fr')).toBe('/projets/');
    expect(indexPath('en')).toBe('/en/projects/');
  });
});

describe('indexRoutes', () => {
  it('builds the index when the locale has a visible sheet', () => {
    expect(indexRoutes(entries, 'fr', false)).toEqual([{ params: { index: undefined } }]);
  });

  it('builds no index without a visible sheet', () => {
    const draftsOnly = [entry('fr/draft', 1, true)];
    expect(indexRoutes(draftsOnly, 'fr', false)).toEqual([]);
    expect(indexRoutes(draftsOnly, 'en', true)).toEqual([]);
  });

  it('builds the index from drafts in development', () => {
    expect(indexRoutes([entry('fr/draft', 1, true)], 'fr', true)).toHaveLength(1);
  });
});

describe('assertUniqueOrder', () => {
  it('accepts distinct orders, and equal orders in different locales', () => {
    expect(() => assertUniqueOrder(entries)).not.toThrow();
  });

  it('rejects two sheets of a locale sharing an order, naming both', () => {
    const clash = [...entries, entry('fr/gamma', 2)];
    expect(() => assertUniqueOrder(clash)).toThrow(/order 2.*fr\/beta.*fr\/gamma/);
  });

  it('counts drafts, so a clash fails before the draft is published', () => {
    expect(() => sheetRoutes([entry('fr/a', 1), entry('fr/b', 1, true)], 'fr', false)).toThrow(
      /order 1/,
    );
  });

  it('is checked when building the sheet routes', () => {
    expect(() => sheetRoutes([entry('fr/a', 1), entry('fr/b', 1)], 'fr', false)).toThrow(/order 1/);
  });
});

describe('assertTranslated', () => {
  it('accepts published sheets published in every locale, and untranslated drafts', () => {
    expect(() => assertTranslated(entries)).not.toThrow();
  });

  it('rejects a published sheet whose translation is missing or still a draft', () => {
    expect(() => assertTranslated([entry('fr/solo', 1)])).toThrow(/fr\/solo.*en\/solo/);
    expect(() => assertTranslated([entry('fr/solo', 1), entry('en/solo', 1, true)])).toThrow(
      /en\/solo/,
    );
  });

  it('is checked when building the sheet routes', () => {
    expect(() => sheetRoutes([entry('fr/solo', 1)], 'fr', false)).toThrow(/en\/solo/);
  });
});
