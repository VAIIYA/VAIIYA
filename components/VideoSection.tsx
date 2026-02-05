'use client'

interface VideoSectionProps {
    src: string
    title?: string
    description?: string
}

export default function VideoSection({ src, title, description }: VideoSectionProps) {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {(title || description) && (
                    <div className="text-center mb-16 space-y-4">
                        {title && (
                            <h2 className="text-4xl sm:text-5xl font-serif">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                <div className="relative">
                    {/* Decorative background blur */}
                    <div className="absolute -inset-4 bg-metamask-orange/5 blur-3xl rounded-[3rem] -z-10"></div>

                    {/* Video Container with Glassmorphism */}
                    <div className="card-vibe p-2 sm:p-4 bg-white/50 backdrop-blur-sm overflow-hidden border border-metamask-gray-100 shadow-2xl">
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src={src} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>

                            {/* Overlay for depth */}
                            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
