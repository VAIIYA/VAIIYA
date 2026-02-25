"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ChangeEvent, useTransition } from 'react';

export default function LanguageSwitcher() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const locale = useLocale();
    const pathname = usePathname();

    function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
        const nextLocale = event.target.value;

        startTransition(() => {
            // Very basic approach to switching locales since standard replace requires matching the right path
            // Using window.location.href or a more robust next-intl/navigation hook would be better.
            // But let's keep it simple: replace the current locale prefix.
            const currentPathname = pathname || '/';
            const pathSegments = currentPathname.split('/');
            if (['en', 'nl', 'de'].includes(pathSegments[1])) {
                pathSegments[1] = nextLocale;
            } else {
                pathSegments.splice(1, 0, nextLocale); // Add it after the first slash
            }

            router.replace(pathSegments.join('/') || '/');
        });
    }

    return (
        <div className="relative inline-block text-left">
            <select
                className="appearance-none bg-transparent border border-gray-600 text-white text-sm rounded-md py-1 px-3 pr-8 focus:outline-none focus:border-metamask-orange transition-colors disabled:opacity-50"
                defaultValue={locale}
                onChange={onSelectChange}
                disabled={isPending}
            >
                <option value="en" className="text-black">EN</option>
                <option value="nl" className="text-black">NL</option>
                <option value="de" className="text-black">DE</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
            </div>
        </div>
    );
}
