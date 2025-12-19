import { ArrowLeft, Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate, Link } from 'react-router-dom';

export function PublicRefundPage() {
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
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl text-gray-900 dark:text-white">Refund & Cancellation Policy</h1>
                            <p className="text-gray-600 dark:text-slate-400">Understanding our digital product policy</p>
                        </div>
                    </div>

                    {/* Important Notice */}
                    <div className="mb-6 p-6 bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg text-red-700 dark:text-red-400 mb-2">No Refunds • No Cancellations</h3>
                                <p className="text-red-600 dark:text-red-400 text-sm">
                                    All sales are final. Due to the digital nature of our products, we cannot offer refunds or cancellations once a purchase is completed and the notes are downloaded.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 text-gray-700 dark:text-slate-300">
                        <div>
                            <h3 className="text-xl text-gray-900 dark:text-white mb-3">Why No Refunds?</h3>
                            <p className="mb-4">
                                Notezy offers digital products (study notes, assignments, PYQ papers) that are delivered instantly upon purchase. Unlike physical products, digital content cannot be "returned" once accessed.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                                    <span><span className="text-gray-900 dark:text-white">Instant Access:</span> You receive immediate access to the content after purchase</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                                    <span><span className="text-gray-900 dark:text-white">Digital Nature:</span> Once downloaded, the content is in your possession</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                                    <span><span className="text-gray-900 dark:text-white">Industry Standard:</span> This is standard practice for digital content platforms</span>
                                </li>
                            </ul>
                        </div>

                        <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-xl text-gray-900 dark:text-white mb-3">Before You Purchase</h3>
                            <p className="mb-4">
                                We encourage all users to make informed decisions before purchasing. Here's what you can do:
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                                    <span><span className="text-gray-900 dark:text-white">Preview Content:</span> Use the preview feature to review sample pages before buying</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                                    <span><span className="text-gray-900 dark:text-white">Read Reviews:</span> Check ratings and reviews from other students</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                                    <span><span className="text-gray-900 dark:text-white">Check Details:</span> Review the note description, page count, and topics covered</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                                    <span><span className="text-gray-900 dark:text-white">Verify Seller:</span> Look at the seller's rating and upload history</span>
                                </li>
                            </ul>
                        </div>

                        <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-xl text-gray-900 dark:text-white mb-3">Order Cancellation</h3>
                            <p className="mb-3">
                                Orders cannot be cancelled once the payment is processed, as you receive immediate access to the purchased content.
                            </p>
                            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-4">
                                <p className="text-sm text-amber-800 dark:text-amber-400">
                                    <span className="text-gray-900 dark:text-white">Tip:</span> Double-check your cart before completing the purchase to ensure you're buying the correct notes.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-xl text-gray-900 dark:text-white mb-3">Technical Issues</h3>
                            <p className="mb-3">
                                If you experience technical difficulties accessing your purchased content, we're here to help:
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                                    <span>Download problems or corrupted files</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                                    <span>Payment processed but content not accessible</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                                    <span>Missing pages or incomplete content</span>
                                </li>
                            </ul>
                            <p className="mt-3 text-sm">
                                Please contact our support team at{' '}
                                <a
                                    href="mailto:notzy2026@gmail.com"
                                    className="text-purple-600 dark:text-purple-400 hover:underline"
                                >
                                    notzy2026@gmail.com
                                </a>
                                {' '}with your order details and we'll resolve the issue promptly.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-xl text-gray-900 dark:text-white mb-3">Content Quality Issues</h3>
                            <p className="mb-3">
                                While we don't offer refunds, we take content quality seriously. If you receive notes that are:
                            </p>
                            <ul className="space-y-2 mb-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                                    <span>Significantly different from the description</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                                    <span>Plagiarized or violate copyright</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                                    <span>Completely unreadable or unusable</span>
                                </li>
                            </ul>
                            <p className="text-sm">
                                Please report the issue to us immediately. We will investigate and may take action against the seller, including removal of the content from our platform.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                <span className="text-gray-900 dark:text-white">Policy Updates:</span> We reserve the right to update this policy at any time. Continued use of the platform after changes constitutes acceptance of the updated policy.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-slate-500 mt-3">
                                Last updated: December 2025
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
