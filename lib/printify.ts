export interface PrintifyProduct {
    id: string;
    title: string;
    description: string;
    images: {
        src: string;
        variant_ids: number[];
        is_default: boolean;
        is_selected_for_publishing: boolean;
    }[];
    variants: {
        id: number;
        price: number;
        is_enabled: boolean;
    }[];
    external: {
        id: string;
        handle: string;
    };
}

const PRINTIFY_API_BASE = 'https://api.printify.com/v1';

export async function getPrintifyProducts() {
    const apiKey = process.env.PRINTIFY_API_KEY;
    const shopId = process.env.PRINTIFY_SHOP_ID;

    if (!apiKey || !shopId) {
        console.error('Printify API key or Shop ID missing');
        return [];
    }

    try {
        const response = await fetch(`${PRINTIFY_API_BASE}/shops/${shopId}/products.json`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Printify API error: ${response.statusText}`);
        }

        const json = await response.json();
        return json.data as PrintifyProduct[];
    } catch (error) {
        console.error('Error fetching Printify products:', error);
        return [];
    }
}
