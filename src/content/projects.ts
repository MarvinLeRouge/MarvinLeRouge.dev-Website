import { homePath, isLocale, LOCALES, type Locale } from '../i18n/locales';

/** Translated URL segment of the project sheets, under each locale's home. */
const SHEETS_SEGMENT: Readonly<Record<Locale, string>> = { fr: 'projets', en: 'projects' };

/** The part of a collection entry these helpers need. Entry ids are `<locale>/<slug>`. */
interface SheetEntry {
  readonly id: string;
  readonly data: { readonly order: number; readonly draft: boolean };
}

/** Locale of a sheet, from its folder. Throws on a sheet outside a locale folder. */
export function sheetLocale(id: string): Locale {
  const [folder] = id.split('/');
  if (!id.includes('/') || !isLocale(folder)) {
    throw new Error(`Project sheet "${id}" must sit in a locale folder (fr/ or en/)`);
  }
  return folder;
}

/** Slug of a sheet: its file name, shared by its translations. */
export function sheetSlug(id: string): string {
  return id.slice(id.indexOf('/') + 1);
}

/** Public URL of a sheet. */
export function sheetPath(locale: Locale, slug: string): string {
  return `${homePath(locale)}${SHEETS_SEGMENT[locale]}/${slug}/`;
}

/** Sheets of a locale in display order, drafts included only on request (development). */
export function visibleSheets<Entry extends SheetEntry>(
  entries: readonly Entry[],
  locale: Locale,
  includeDrafts: boolean,
): Entry[] {
  return entries
    .filter((entry) => sheetLocale(entry.id) === locale && (includeDrafts || !entry.data.draft))
    .sort((a, b) => a.data.order - b.data.order);
}

/** The same sheet in another locale, if it exists among `entries`. */
export function translationOf<Entry extends SheetEntry>(
  entries: readonly Entry[],
  entry: Entry,
  locale: Locale,
): Entry | undefined {
  return entries.find((other) => other.id === `${locale}/${sheetSlug(entry.id)}`);
}

/**
 * Static routes of the sheets of a locale, for `getStaticPaths`. Each route carries its sheet and,
 * when the sheet exists in every locale, the path of each version (hreflang alternates).
 */
export function sheetRoutes<Entry extends SheetEntry>(
  entries: readonly Entry[],
  locale: Locale,
  includeDrafts: boolean,
) {
  // Drafts are dropped first, so a published sheet never links to a draft translation.
  const visible = entries.filter((entry) => includeDrafts || !entry.data.draft);
  return visibleSheets(visible, locale, true).map((sheet) => {
    const slug = sheetSlug(sheet.id);
    const translated = LOCALES.every((other) => translationOf(visible, sheet, other));
    const translations = translated
      ? (Object.fromEntries(LOCALES.map((other) => [other, sheetPath(other, slug)])) as Record<
          Locale,
          string
        >)
      : undefined;
    return { params: { slug }, props: { sheet, translations } };
  });
}
