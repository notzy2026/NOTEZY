import { ArrowLeft, Truck, Download, Clock, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

interface ShippingPageProps {
  onBack: () => void;
}

export function ShippingPage({ onBack }: ShippingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 lg:ml-64 pt-20 pb-24 lg:pt-0 lg:pb-8">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Settings
          </Button>
          <h1 className="text-2xl lg:text-3xl text-gray-900 dark:text-white mb-2">Shipping & Delivery Policy</h1>
          <p className="text-gray-600 dark:text-slate-400">Digital delivery information</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl text-gray-900 dark:text-white">Digital Delivery</h2>
          </div>

          {/* Highlight Box */}
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Download className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg text-gray-900 dark:text-white mb-2">100% Digital - No Physical Shipping</h3>
                <p className="text-gray-700 dark:text-slate-300 text-sm">
                  All notes are delivered digitally through our platform. There's no physical shipping involved, which means instant access and no delivery charges!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-gray-700 dark:text-slate-300">
            <div>
              <h3 className="text-xl text-gray-900 dark:text-white mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-1">Purchase Notes</h4>
                    <p className="text-sm">Browse and purchase the notes you need from our marketplace</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400">2</span>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-1">Instant Access</h4>
                    <p className="text-sm">Payment is processed securely and you get immediate access</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-100 dark:bg-pink-500/20 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 dark:text-pink-400">3</span>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-1">Download from "Downloads" Section</h4>
                    <p className="text-sm">Access all your purchased notes anytime from the Downloads page</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-xl text-gray-900 dark:text-white mb-4">Delivery Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h4 className="text-gray-900 dark:text-white">Processing Time</h4>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-slate-300">
                    <span className="text-green-600 dark:text-green-400">Instant</span> - Notes are available immediately after payment confirmation
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-gray-900 dark:text-white">Download Speed</h4>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-slate-300">
                    Depends on your internet connection - typically a few seconds
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Benefits of Digital Delivery</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span><span className="text-gray-900 dark:text-white">Instant Access:</span> No waiting for shipping - get your notes immediately after purchase</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span><span className="text-gray-900 dark:text-white">No Shipping Charges:</span> Zero delivery fees - pay only for the content</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span><span className="text-gray-900 dark:text-white">Access Anywhere:</span> Download on any device, anytime, from anywhere</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span><span className="text-gray-900 dark:text-white">Eco-Friendly:</span> No paper waste or carbon emissions from shipping</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span><span className="text-gray-900 dark:text-white">Permanent Access:</span> Your purchased notes remain in your Downloads section indefinitely</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Accessing Your Notes</h3>
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                <p className="text-sm">To access your purchased notes:</p>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">1.</span>
                    <span>Navigate to the <span className="text-gray-900 dark:text-white">"Downloads"</span> section from the main menu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">2.</span>
                    <span>Find the notes you want to view</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">3.</span>
                    <span>Click <span className="text-gray-900 dark:text-white">"View Notes"</span> to open them in our built-in PDF viewer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">4.</span>
                    <span>You can view, zoom, and navigate through the notes at your convenience</span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Technical Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>Internet connection for downloading</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>PDF viewer (built into the platform) or PDF reader software</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>Compatible with all modern browsers and devices</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Having Issues?</h3>
              <p className="mb-3">
                If you experience any problems accessing your purchased notes:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>Check your internet connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>Ensure your payment was successfully processed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>Try refreshing the Downloads page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>Clear your browser cache and cookies</span>
                </li>
              </ul>
              <p className="text-sm">
                Still having trouble? Contact our support team at{' '}
                <a
                  href="mailto:notzy2026@gmail.com"
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  notzy2026@gmail.com
                </a>
                {' '}and we'll help you resolve the issue.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                <span className="text-gray-900 dark:text-white">Remember:</span> All notes are delivered digitally. There are no physical products shipped, no tracking numbers, and no delivery addresses required. Everything happens instantly online!
              </p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500 dark:text-slate-500">
                Last updated: December 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
