import createMiddleware from 'next-intl/middleware';

export const locales = ['en', 'nl', 'de'] as const;

export const pathnames = {
    '/': '/',
    '/about': {
        en: '/about',
        nl: '/over-ons',
        de: '/ueber-uns'
    },
    '/projects/luckyhaus': '/projects/luckyhaus',
    '/projects/memehaus': '/projects/memehaus',
    '/projects/vynder': '/projects/vynder',
    '/projects/nightstudio': '/projects/nightstudio',
    '/projects/blobio': '/projects/blobio',
    '/projects/hunter84': '/projects/hunter84',
    '/shop': {
        en: '/shop',
        nl: '/winkel',
        de: '/shop'
    },
    '/progress': {
        en: '/progress',
        nl: '/voortgang',
        de: '/fortschritt'
    }
};

export default createMiddleware({
    locales,
    defaultLocale: 'en',
    pathnames,
    localePrefix: 'as-needed'
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(de|en|nl)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
