import Link from 'next/link'
import Footer from '@/components/Footer'
import { getPrintifyProducts } from '@/lib/printify'

export const metadata = {
    title: 'VAIIYA Shop - Premium Web3 Gear',
    description: 'Exclusive VAIIYA merchandise. High-vibe gear for the sovereign builder.',
}

export default async function ShopPage() {
    const products = await getPrintifyProducts();

    return (
        <main className="min-h-screen bg-white selection:bg-metamask-orange selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-metamask-gray-50/50">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-metamask-gray-100 shadow-sm text-metamask-orange text-xs font-bold tracking-widest uppercase mb-8">
                        VAIIYA COLLECTIONS
                    </div>
                    <h1 className="text-6xl sm:text-7xl font-serif mb-8 text-metamask-purple">
                        Wear the <br />
                        <span className="text-metamask-orange">Vibe.</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Premium merchandise designed for creators, builders, and degens.
                        Fulfilled by Printify, powered by VAIIYA.
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-metamask-orange/5 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-metamask-purple/5 rounded-full blur-3xl opacity-50"></div>
            </section>

            {/* Products Grid */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-metamask-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                        <h3 className="text-2xl font-serif text-metamask-purple mb-4">No products found</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            We&apos;re currently updating our store. Please add your PRINTIFY_API_KEY and PRINTIFY_SHOP_ID to see products.
                        </p>
                        <Link href="/" className="btn-secondary">
                            Back to Home
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {products.map((product) => {
                            const defaultImage = product.images.find(img => img.is_default) || product.images[0];
                            const price = product.variants[0]?.price ? (product.variants[0].price / 100).toFixed(2) : '0.00';

                            // Fix: Use external handle if it's a full URL, otherwise construct it
                            let shopUrl = `https://vaiiya.printify.me/product/${product.id}`;
                            if (product.external?.handle && product.external.handle.startsWith('http')) {
                                shopUrl = product.external.handle;
                            } else if (product.external?.id) {
                                shopUrl = `https://vaiiya.printify.me/product/${product.external.id}`;
                            }

                            return (
                                <div key={product.id} className="group">
                                    <div className="relative aspect-square mb-6 overflow-hidden bg-metamask-gray-50 rounded-[40px] border border-metamask-gray-100 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-metamask-gray-100/50 group-hover:-translate-y-2">
                                        {defaultImage && (
                                            <img
                                                src={defaultImage.src}
                                                alt={product.title}
                                                className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-metamask-purple/0 group-hover:bg-metamask-purple/5 transition-colors duration-500"></div>

                                        {/* Quick View Button (Redirect) */}
                                        <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <a
                                                href={shopUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full btn-primary block text-center shadow-2xl"
                                            >
                                                Shop in Pop-up Store
                                            </a>
                                        </div>
                                    </div>

                                    <div className="px-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-medium text-metamask-purple group-hover:text-metamask-orange transition-colors duration-300">
                                                {product.title}
                                            </h3>
                                            <span className="text-lg font-bold text-metamask-purple">${price}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                                            {product.description.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Quote / Philosophy Section */}
            <section className="py-24 bg-metamask-purple text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <p className="text-3xl sm:text-4xl font-serif leading-relaxed italic text-purple-100">
                        &quot;Quality gear for a quality ecosystem. Every purchase supports the development of VAIIYA open-source projects.&quot;
                    </p>
                    <div className="mt-12 h-px w-24 bg-metamask-orange mx-auto"></div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
