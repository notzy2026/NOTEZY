import { ArrowLeft, GraduationCap, IndianRupee } from 'lucide-react';
import { Button } from './ui/button';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
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
          <h1 className="text-2xl lg:text-3xl text-gray-900 dark:text-white mb-2">About Us</h1>
          <p className="text-gray-600 dark:text-slate-400">Learn more about Notezy</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl text-gray-900 dark:text-white">Welcome to Notezy</h2>
          </div>

          <div className="space-y-4 text-gray-700 dark:text-slate-300">
            <p>
              Welcome to <span className="text-gray-900 dark:text-white">Notezy</span> - a brand new platform designed by students, for students. We understand the challenges of finding quality study materials and the effort that goes into creating excellent notes.
            </p>

            <p>
              Our mission is simple: to provide students with easy access to high-quality <span className="text-purple-600 dark:text-purple-400">assignments</span>, <span className="text-purple-600 dark:text-purple-400">previous year question papers (PYQs)</span>, and <span className="text-purple-600 dark:text-purple-400">lecture notes</span> while empowering content creators to earn from their hard work.
            </p>

            <p>
              Whether you're looking to excel in your studies or want to monetize your knowledge, Notezy is your one-stop platform. Join our growing community and experience the future of academic resource sharing.
            </p>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-xl text-gray-900 dark:text-white mb-4">What We Provide</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span><span className="text-gray-900 dark:text-white">Assignments:</span> High-quality assignment solutions from top students across various subjects and courses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span><span className="text-gray-900 dark:text-white">PYQ Papers:</span> Previous year question papers with detailed solutions to help you ace your exams</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 dark:text-pink-400 mt-1">•</span>
                  <span><span className="text-gray-900 dark:text-white">Lecture Notes:</span> Comprehensive lecture notes prepared by experienced students and educators</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                <IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-600 dark:text-blue-400">Start earning by selling your notes today!</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Contact Us</h3>
              <p className="text-gray-600 dark:text-slate-400 mb-2">
                Have questions or feedback? We'd love to hear from you!
              </p>
              <a
                href="mailto:notzy2026@gmail.com"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                notzy2026@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
