import { useTranslations } from 'next-intl';

export default function DeleteAccount() {
    const t = useTranslations('Footer');

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-metamask-orange/10">
            <main className="max-w-4xl mx-auto px-6 py-20">
                <header className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-metamask-orange/10 text-metamask-orange text-[10px] font-bold tracking-widest uppercase mb-6">
                        FYNDER Support
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight text-metamask-purple">Delete Account</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-500 text-sm font-medium">
                        <p>Product: <span className="text-metamask-purple">FYNDER Android</span></p>
                        <span className="hidden sm:inline text-gray-200">|</span>
                        <p>Action: <span className="text-red-500 font-semibold">Permanent Deletion</span></p>
                    </div>
                </header>

                <div className="space-y-16 prose prose-indigo max-w-none">
                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">Request Account Deletion</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            We value your privacy and your right to be forgotten. If you wish to stop using FYNDER and want your data
                            removed from our systems, you can request a permanent account deletion.
                        </p>
                    </section>

                    <section className="bg-metamask-gray-50 border border-metamask-gray-100 p-8 rounded-[32px]">
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6">What is deleted?</h2>
                        <p className="text-gray-600 mb-8">When you delete your account, the following data is permanently removed from our production databases:</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { title: 'Profile Info', desc: 'Your name, age, bio, and all personal preferences.' },
                                { title: 'Photos', desc: 'All uploaded profile pictures and private gallery images.' },
                                { title: 'Matches', desc: 'All active and past match connections with other users.' },
                                { title: 'Messages', desc: 'Your entire chat history across all conversations.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-metamask-gray-100 shadow-sm shrink-0">
                                        <span className="text-metamask-orange text-sm font-bold">{i + 1}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-metamask-purple mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">How to Delete</h2>
                        <div className="space-y-6">
                            <div className="p-6 border border-metamask-gray-100 rounded-2xl bg-white hover:border-metamask-orange/20 transition-all">
                                <h3 className="font-bold text-metamask-purple mb-2">Option 1: In-App Deletion</h3>
                                <p className="text-gray-600 text-sm">
                                    Open FYNDER &gt; Go to Profile Settings &gt; Safety & Privacy &gt; Tap &quot;Delete Account&quot;.
                                    This is the fastest method and processes your request instantly.
                                </p>
                            </div>

                            <div className="p-6 border border-metamask-gray-100 rounded-2xl bg-white hover:border-metamask-orange/20 transition-all">
                                <h3 className="font-bold text-metamask-purple mb-2">Option 2: Email Request</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    If you no longer have access to the app, you can email our support team. Please include your
                                    registered email or phone number.
                                </p>
                                <a href="mailto:support@vaiiya.com" className="text-metamask-orange font-mono font-bold hover:text-metamask-purple transition-colors">
                                    support@vaiiya.com
                                </a>
                            </div>
                        </div>
                    </section>

                    <section className="bg-red-50 border border-red-100 p-8 rounded-2xl">
                        <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Important Notice
                        </h2>
                        <p className="text-red-800 text-sm leading-relaxed">
                            Account deletion is **permanent and irreversible**. Once processed, your profile cannot be restored.
                            Please note that certain data may be retained for a limited period if required by law or for
                            legitimate security purposes (e.g., preventing banned users from creating new accounts).
                        </p>
                    </section>

                    <section className="text-center py-12 border-t border-metamask-gray-100">
                        <h2 className="text-lg font-semibold text-metamask-purple mb-4">Questions about your data?</h2>
                        <p className="text-gray-500 text-sm mb-8">Visit our Privacy Policy for more details on how we handle user information.</p>
                        <div className="flex justify-center gap-4">
                            <a href="/privacy-policy" className="px-6 py-2 bg-metamask-gray-50 hover:bg-metamask-gray-100 rounded-lg text-sm font-bold text-metamask-purple transition-all">
                                View Privacy Policy
                            </a>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
