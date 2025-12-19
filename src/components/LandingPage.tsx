import { useState } from 'react';
import { Upload, BookOpen, FileText, GraduationCap, IndianRupee, Shield, FileCheck, Truck, Mail, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export function LandingPage({ onNavigateToLogin, onNavigateToSignup }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark, toggleTheme } = useTheme();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const features = [
    {
      icon: FileText,
      title: 'Assignments',
      description: 'Access high-quality assignment solutions from top students across various subjects and courses.'
    },
    {
      icon: BookOpen,
      title: 'PYQ Papers',
      description: 'Download previous year question papers with detailed solutions to ace your exams.'
    },
    {
      icon: GraduationCap,
      title: 'Lecture Notes',
      description: 'Comprehensive lecture notes prepared by experienced students and educators.'
    },
    {
      icon: IndianRupee,
      title: 'Earn Money',
      description: 'Upload your notes and earn from every download. Turn your knowledge into income.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 dark:text-white">Notezy</h1>
                <p className="text-xs text-gray-600 dark:text-slate-400 hidden sm:block">Knowledge Marketplace</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('about')} className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                About Us
              </button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Contact
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Button
                onClick={onNavigateToLogin}
                variant="ghost"
                className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                Login
              </Button>
              <Button
                onClick={onNavigateToSignup}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-800">
              <div className="flex flex-col gap-2">
                <button onClick={() => scrollToSection('about')} className="text-left px-4 py-2 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  About Us
                </button>
                <button onClick={() => scrollToSection('features')} className="text-left px-4 py-2 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  Features
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-left px-4 py-2 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  Contact
                </button>
                <div className="flex gap-2 px-4 pt-2">
                  <Button
                    onClick={onNavigateToLogin}
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={onNavigateToSignup}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-slate-800/50 border border-green-200 dark:border-slate-700 rounded-full mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 dark:text-slate-300">New Platform • Just Launched</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-white mb-6">
              Your Academic Success
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Access quality assignments, PYQs, and lecture notes. Share your knowledge and earn from your notes.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for notes, assignments, PYQ papers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onNavigateToSignup}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl text-lg px-8 py-6"
              >
                Get Started Free
              </Button>
              <Button
                onClick={() => scrollToSection('features')}
                variant="outline"
                className="border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl text-gray-900 dark:text-white mb-4">What We Offer</h2>
            <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need to excel in your studies and earn from your knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all group hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 lg:p-12 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl text-gray-900 dark:text-white">About Us</h2>
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
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                  <IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-600 dark:text-blue-400">Start earning by selling your notes today!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Policies Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Privacy Policy */}
            <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                <h3 className="text-xl text-gray-900 dark:text-white">Privacy Policy</h3>
              </div>
              <p className="text-gray-700 dark:text-slate-300 mb-4">
                Your privacy and security are our top priorities. We implement industry-standard security measures to protect your personal information.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>All user data is encrypted and stored securely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>We never share your personal information with third parties</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>Payment information is processed through secure gateways</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span>You have full control over your data and can request deletion anytime</span>
                </li>
              </ul>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl text-gray-900 dark:text-white">Terms & Conditions</h3>
              </div>
              <p className="text-gray-700 dark:text-slate-300 mb-4">
                By using Notezy, you agree to our terms of service designed to ensure a fair and transparent marketplace.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>All uploaded content must be original or properly authorized</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span><span className="text-amber-600 dark:text-yellow-400">Notes once purchased cannot be returned or refunded</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Sellers are responsible for the accuracy of their content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Platform fees apply to all transactions</span>
                </li>
              </ul>
            </div>

            {/* Refund & Cancellation */}
            <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
                <h3 className="text-xl text-gray-900 dark:text-white">Refund & Cancellation</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                  <p className="text-red-700 dark:text-red-400">
                    <span>No Refunds • No Cancellations</span>
                  </p>
                </div>
                <p className="text-gray-700 dark:text-slate-300 text-sm">
                  Due to the digital nature of our products, all sales are final. Once you purchase and download notes, they cannot be returned or refunded.
                </p>
                <p className="text-gray-600 dark:text-slate-400 text-sm">
                  We encourage users to carefully review note previews, ratings, and reviews before making a purchase. If you encounter any issues with downloaded content, please contact our support team.
                </p>
              </div>
            </div>

            {/* Shipping & Delivery */}
            <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl text-gray-900 dark:text-white">Shipping & Delivery</h3>
              </div>
              <p className="text-gray-700 dark:text-slate-300 mb-4">
                All notes are delivered digitally - no physical shipping required!
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>Instant access after payment confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>Download your purchased notes from the "Downloads" section</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>Access your notes anytime, anywhere</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                  <span>No delivery charges or waiting time</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-800/30 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 lg:p-12 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl text-gray-900 dark:text-white mb-4">Get in Touch</h2>
            <p className="text-gray-700 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Have questions, feedback, or need support? We'd love to hear from you! Our team is here to help.
            </p>
            <a
              href="mailto:notzy2026@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>notzy2026@gmail.com</span>
            </a>
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                We're a growing platform and currently focused on email support. Social media channels coming soon!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white">Notezy</h3>
                <p className="text-xs text-gray-600 dark:text-slate-400">Knowledge Marketplace</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-slate-400">
              <button onClick={() => scrollToSection('about')} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                About Us
              </button>
              <button onClick={() => scrollToSection('features')} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Contact
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-800 text-center text-sm text-gray-500 dark:text-slate-500">
            <p>&copy; 2025 Notezy. All rights reserved. Built for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
