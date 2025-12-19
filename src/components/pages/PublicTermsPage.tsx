import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate, Link } from 'react-router-dom';

export function PublicTermsPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-gray-900 dark:text-white font-semibold">Notezy</h1>
                                <p className="text-xs text-gray-600 dark:text-slate-400 hidden sm:block">Knowledge Marketplace</p>
                            </div>
                        </Link>
                        <Button
                            onClick={() => navigate('/')}
                            variant="ghost"
                            className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Home
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4 lg:p-8 py-8">
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
                    <h1 className="text-3xl text-gray-900 dark:text-white mb-6">Terms & Conditions</h1>

                    <div className="space-y-6 text-gray-700 dark:text-slate-300">
                        <section>
                            <h2 className="text-xl text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                            <p className="leading-relaxed">
                                By accessing and using Notezy, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl text-gray-900 dark:text-white mb-3">2. User Accounts</h2>
                            <p className="leading-relaxed mb-3">
                                To access certain features of the platform, you must create an account. You agree to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide accurate and complete information</li>
                                <li>Maintain the security of your password</li>
                                <li>Accept responsibility for all activities under your account</li>
                                <li>Notify us immediately of any unauthorized access</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl text-gray-900 dark:text-white mb-3">3. Content Guidelines</h2>
                            <p className="leading-relaxed mb-3">
                                When uploading notes and educational materials, you must ensure that:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>You own the copyright or have permission to share the content</li>
                                <li>The content does not violate any intellectual property rights</li>
                                <li>The material is accurate and not misleading</li>
                                <li>The content does not contain harmful or inappropriate material</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl text-gray-900 dark:text-white mb-3">4. Purchases and Payments</h2>
                            <p className="leading-relaxed">
                                All purchases made through Notezy are final. We reserve the right to refuse or cancel any transaction. Sellers agree to our revenue sharing model, and earnings will be paid according to our payment schedule.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl text-gray-900 dark:text-white mb-3">5. Intellectual Property</h2>
                            <p className="leading-relaxed">
                                The Notezy platform, including its design, features, and original content, is protected by copyright and other intellectual property laws. Users retain ownership of their uploaded content but grant us a license to display and distribute it through our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl text-gray-900 dark:text-white mb-3">6. Prohibited Activities</h2>
                            <p className="leading-relaxed mb-3">
                                Users are prohibited from:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Uploading copyrighted material without permission</li>
                                <li>Engaging in fraudulent activities</li>
                                <li>Harassing or threatening other users</li>
                                <li>Attempting to compromise platform security</li>
                                <li>Using automated tools to scrape content</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl text-gray-900 dark:text-white mb-3">7. Termination</h2>
                            <p className="leading-relaxed">
                                We reserve the right to suspend or terminate accounts that violate these terms without prior notice. Users may close their accounts at any time through the settings page.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl text-gray-900 dark:text-white mb-3">8. Limitation of Liability</h2>
                            <p className="leading-relaxed">
                                Notezy is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our platform, including but not limited to loss of data, revenue, or educational opportunities.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl text-gray-900 dark:text-white mb-3">9. Changes to Terms</h2>
                            <p className="leading-relaxed">
                                We reserve the right to modify these terms at any time. Users will be notified of significant changes via email. Continued use of the platform after changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl text-gray-900 dark:text-white mb-3">10. Contact Information</h2>
                            <p className="leading-relaxed">
                                For questions about these terms, please contact us at{' '}
                                <a href="mailto:notzy2026@gmail.com" className="text-purple-600 dark:text-purple-400 hover:underline">
                                    notzy2026@gmail.com
                                </a>
                            </p>
                        </section>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                Last updated: December 2025
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
