import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from './ui/button';

interface PrivacyPageProps {
  onBack: () => void;
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
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
          <h1 className="text-2xl lg:text-3xl text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-slate-400">How we protect and handle your data</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl text-gray-900 dark:text-white">Your Privacy Matters</h2>
          </div>

          <div className="space-y-6 text-gray-700 dark:text-slate-300">
            <p className="text-lg text-gray-900 dark:text-white">
              Your privacy and security are our top priorities. We implement industry-standard security measures to protect your personal information.
            </p>

            <div>
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Data Protection</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span><span className="text-gray-900 dark:text-white">Encryption:</span> All user data is encrypted and stored securely using industry-standard protocols</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span><span className="text-gray-900 dark:text-white">No Third-Party Sharing:</span> We never share your personal information with third parties without your explicit consent</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span><span className="text-gray-900 dark:text-white">Secure Payments:</span> Payment information is processed through secure, PCI-compliant gateways</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span><span className="text-gray-900 dark:text-white">Data Control:</span> You have full control over your data and can request deletion anytime</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Information We Collect</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Account information (name, email address)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Transaction history and purchase records</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Uploaded content and notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Usage data and analytics (anonymous)</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">How We Use Your Data</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>To provide and improve our services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>To process transactions and payments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>To send important account updates (with your permission)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>To prevent fraud and ensure platform security</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Your Rights</h3>
              <p className="mb-3">You have the right to:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 dark:text-pink-400 mt-1">•</span>
                  <span>Access your personal data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 dark:text-pink-400 mt-1">•</span>
                  <span>Request correction of inaccurate data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 dark:text-pink-400 mt-1">•</span>
                  <span>Request deletion of your account and data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 dark:text-pink-400 mt-1">•</span>
                  <span>Opt-out of marketing communications</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                <span className="text-gray-900 dark:text-white">Note:</span> Notezy is not meant for collecting personally identifiable information (PII) or handling sensitive data beyond what's necessary for the platform operation. We are committed to data minimization and only collect what's essential.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                For any privacy-related questions or to exercise your rights, please contact us at{' '}
                <a
                  href="mailto:notzy2026@gmail.com"
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  notzy2026@gmail.com
                </a>
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-500 mt-4">
                Last updated: December 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
