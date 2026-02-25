import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'nl', 'de'];

export default getRequestConfig(async ({ locale }) => {
    const loc = locale as string;
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(loc as any)) notFound();

    return {
        locale: loc,
        messages: (await import(`../messages/${loc}.json`)).default
    };
});
