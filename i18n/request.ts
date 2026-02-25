import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'nl', 'de'];

export default getRequestConfig(async ({ locale }) => {
    const loc = locale as string;
    console.log('Detected locale:', loc);
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(loc as any)) {
        console.log('Locale not valid, calling notFound:', loc);
        notFound();
    }

    return {
        locale: loc,
        messages: (await import(`../messages/${loc}.json`)).default
    };
});
