/** Civil name, shown alongside the MarvinLeRouge identity. */
export const CIVIL_NAME = 'Jean Ceugniet';

/** Online identity, used across GitHub and the site. */
export const PSEUDONYM = 'MarvinLeRouge';

/** Site name, shown by link previews. */
export const SITE_NAME = 'MarvinLeRouge.dev';

/** Page background color, also used for the mobile browser toolbar and the web app manifest. */
export const THEME_COLOR = '#111111';

export const GITHUB_URL = 'https://github.com/MarvinLeRouge';

export const LINKEDIN_URL = 'https://www.linkedin.com/in/jean-ceugniet/';

/**
 * Contact address, encoded with `encodeEmail` so it never appears in plain text, here or in the HTML.
 * To change it: `node -e "console.log(btoa([...process.argv[1]].reverse().join('')))" <address>`.
 */
export const ENCODED_EMAIL = 'dmVkLmVndW9yZWxuaXZyYW1AdGNhdG5vYw==';
