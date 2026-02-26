import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'nl', 'de'];

export default getRequestConfig(async ({ requestLocale }) => {
    let loc = await requestLocale;
    console.log('Detected locale:', loc);

    // Validate that the incoming `locale` parameter is valid
    if (!loc || !locales.includes(loc as any)) {
        console.log('Locale not valid, falling back to default:', loc);
        loc = 'en';
    }

    return {
        locale: loc,
        messages: (await import(`../messages/${loc}.json`)).default
    };
});
