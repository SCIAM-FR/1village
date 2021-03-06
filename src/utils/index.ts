import md5 from 'md5';

/**
 * Returns a query string with the given parameters.
 */
export function serializeToQueryUrl(obj: { [key: string]: string | number | boolean }): string {
  if (Object.keys(obj).length === 0) {
    return '';
  }
  const str =
    '?' +
    Object.keys(obj)
      .reduce(function (a, k) {
        a.push(k + '=' + encodeURIComponent(obj[k]));
        return a;
      }, [])
      .join('&');
  return str;
}

export function getQueryString(q: string | string[]): string {
  if (Array.isArray(q)) {
    return q[0];
  }
  return q;
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 */
export function debounce<T extends (args: unknown | unknown[]) => unknown | unknown[]>(
  func: T,
  wait: number,
  immediate: boolean,
  ...args: unknown[]
): T {
  let timeout: NodeJS.Timeout;
  return (function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /*@ts-ignore */ //eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-explicit-any
    const context: any = this;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  } as unknown) as T;
}

// ISO 3166-1 alpha-2
// ⚠️ No support for IE 11
export function countryToFlag(isoCode: string): string {
  return typeof String.fromCodePoint !== 'undefined'
    ? isoCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    : isoCode;
}

export const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '';
export const ssoHost = process.env.NEXT_PUBLIC_PLM_HOST || '';
export const ssoHostName = ssoHost.replace(/(^\w+:|^)\/\//, '');

/**
 * Returns a random token. Browser only!
 * @param length length of the returned token.
 */
export function generateTemporaryToken(length: number = 40): string {
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const cryptoObj = !process.browser
    ? null
    : window.crypto || 'msCrypto' in window
    ? (window as Window & typeof globalThis & { msCrypto: Crypto }).msCrypto
    : null; // for IE 11
  if (!cryptoObj) {
    return Array(length)
      .fill(validChars)
      .map(function (x) {
        return x[Math.floor(Math.random() * x.length)];
      })
      .join('');
  }
  let array = new Uint8Array(length);
  cryptoObj.getRandomValues(array);
  array = array.map((x) => validChars.charCodeAt(x % validChars.length));
  const randomState = String.fromCharCode.apply(null, array);
  return randomState;
}

export function isValidHttpUrl(value: string): boolean {
  let url;
  try {
    url = new URL(value);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

export const getGravatarUrl = (email: string): string => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s40&r=g&d=identicon`;
};

export const toDate = (date: string): string => {
  return Intl.DateTimeFormat('fr', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(date));
};

function addDotToElement(element: HTMLElement): void {
  const innerText = element.innerText || '';
  if (innerText.length > 0 && !/\W/im.test(innerText.slice(-1))) {
    element.innerText = `${innerText}.`;
  }
}
export function htmlToText(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  [...tmp.children].forEach(addDotToElement);
  return tmp.textContent || tmp.innerText || '';
}
