import { ArrowLeft, Upload, Mail, MessageSquare, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate, Link } from 'react-router-dom';

export function ContactUsPage() {
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
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6 shadow-xl">
                        <Mail className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl text-gray-900 dark:text-white mb-4">Contact Us</h1>
                    <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Have questions, feedback, or need support? We'd love to hear from you! Our team is here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
                        <h2 className="text-2xl text-gray-900 dark:text-white mb-6">Get in Touch</h2>

                        <div className="space-y-6">
                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 dark:text-white font-medium mb-1">Email Us</h3>
                                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                                        For general inquiries and support
                                    </p>
                                    <a
                                        href="mailto:notzy2026@gmail.com"
                                        className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                                    >
                                        notzy2026@gmail.com
                                    </a>
                                </div>
                            </div>

                            {/* Response Time */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 dark:text-white font-medium mb-1">Response Time</h3>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">
                                        We typically respond within 24-48 hours during business days
                                    </p>
                                </div>
                            </div>

                            {/* Support Chat */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 dark:text-white font-medium mb-1">In-App Support</h3>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">
                                        Logged-in users can access our support chat directly from the app for faster assistance
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* What We Can Help With */}
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
                        <h2 className="text-2xl text-gray-900 dark:text-white mb-6">How Can We Help?</h2>

                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                                <h3 className="text-gray-900 dark:text-white font-medium mb-2">🛒 Purchase Issues</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                    Problems with payments, accessing purchased notes, or transaction disputes
                                </p>
                            </div>

                            <div className="p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl">
                                <h3 className="text-gray-900 dark:text-white font-medium mb-2">📤 Seller Support</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                    Help with uploading notes, earnings withdrawals, or seller account issues
                                </p>
                            </div>

                            <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                                <h3 className="text-gray-900 dark:text-white font-medium mb-2">🔧 Technical Support</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                    App bugs, download issues, or account-related technical problems
                                </p>
                            </div>

                            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                                <h3 className="text-gray-900 dark:text-white font-medium mb-2">💡 Feedback & Suggestions</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                    Ideas for new features, improvements, or general feedback about the platform
                                </p>
                            </div>

                            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                                <h3 className="text-gray-900 dark:text-white font-medium mb-2">⚠️ Report Content</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                    Report plagiarized, inappropriate, or misleading content on the platform
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Teaser */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-6 lg:p-8 text-center">
                    <h2 className="text-xl text-gray-900 dark:text-white mb-3">Before You Contact Us</h2>
                    <p className="text-gray-600 dark:text-slate-400 mb-4">
                        Many common questions are answered in our policy pages. Check them out for quick answers!
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            to="/terms"
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Terms & Conditions
                        </Link>
                        <Link
                            to="/privacy"
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/refund"
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Refund Policy
                        </Link>
                        <Link
                            to="/shipping"
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Shipping & Delivery
                        </Link>
                    </div>
                </div>

                {/* Social Coming Soon */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-slate-500">
                        We're a growing platform and currently focused on email support. Social media channels coming soon!
                    </p>
                </div>
            </div>
        </div>
    );
}
