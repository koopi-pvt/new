'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield, Lock, Eye, Database, UserCheck, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Shield Pattern Background */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-blue-500 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 border-2 border-green-500 rounded-[24px] rotate-12"></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 border-2 border-purple-500 rounded-[24px] -rotate-6"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated Shield */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500 mb-6 shadow-2xl"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: January 15, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-white/70 rounded-[24px] border border-white/50 shadow-xl p-8 sm:p-12">
            
            {/* Important Notice */}
            <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Your Privacy is Our Priority</h3>
                  <p className="text-sm text-gray-700">
                    This Privacy Policy explains how Koopi collects, uses, and protects your personal information. By using our platform, you agree to the terms outlined in this policy.
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-gray max-w-none">
              {/* Section 1 */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">1. Information We Collect</h2>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1.1 Account Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you create a Koopi account, we collect your email address, name, and store details. This information is essential for providing you with our services and managing your account.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">1.2 Store Data</h3>
                <p className="text-gray-700 leading-relaxed">
                  We collect information about your products, orders, customers, and store customization preferences. This data is stored securely in our Firebase database and is only accessible to you and authorized Koopi personnel for support purposes.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">1.3 Usage Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  We automatically collect information about how you use our platform, including pages visited, features used, and time spent on the platform. This helps us improve our services and user experience.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">1.4 Device and Browser Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  We collect technical information such as your IP address, browser type, device type, and operating system. This information helps us optimize the platform for different devices and browsers.
                </p>
              </div>

              {/* Section 2 */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">2. How We Use Your Information</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and manage your orders and transactions</li>
                  <li>Send you important updates, notifications, and promotional emails</li>
                  <li>Respond to your questions and provide customer support</li>
                  <li>Analyze usage patterns and optimize platform performance</li>
                  <li>Detect and prevent fraud, abuse, and security incidents</li>
                  <li>Comply with legal obligations and enforce our Terms of Service</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">3. Data Protection & Security</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect your data, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                  <li>SSL/TLS encryption for all data transmission</li>
                  <li>Secure Firebase infrastructure with access controls</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Encrypted data storage and secure backup systems</li>
                  <li>Strict access controls and authentication requirements</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  While we take every reasonable precaution to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to maintaining the highest standards.
                </p>
              </div>

              {/* Section 4 */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 We Do Not Sell Your Data</h3>
                <p className="text-gray-700 leading-relaxed">
                  We do not sell, rent, or trade your personal information to third parties for marketing purposes. Your data is yours, and we respect that.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">4.2 Service Providers</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may share your information with trusted third-party service providers who help us operate our platform, such as:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                  <li>Firebase (Google) - for database, authentication, and hosting</li>
                  <li>SendGrid - for transactional email delivery</li>
                  <li>Payment processors - when online payments are enabled</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  These service providers are contractually obligated to protect your data and use it only for the purposes we specify.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">4.3 Legal Requirements</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may disclose your information if required by law, legal process, or government request, or to protect our rights, property, or safety.
                </p>
              </div>

              {/* Section 5 */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-6 h-6 text-amber-500" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">5. Your Privacy Rights</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                  <li><strong>Data Portability:</strong> Request your data in a machine-readable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails at any time</li>
                  <li><strong>Object:</strong> Object to certain data processing activities</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise any of these rights, please contact us at privacy@koopi.lk.
                </p>
              </div>

              {/* Section 6 */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies help us remember your preferences, analyze site traffic, and provide personalized features.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You can control cookies through your browser settings. However, disabling cookies may affect the functionality of certain features.
                </p>
              </div>

              {/* Section 7 */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as your account is active or as needed to provide you services. If you close your account, we will delete or anonymize your data within 90 days, except where we are required to retain it for legal or compliance purposes.
                </p>
              </div>

              {/* Section 8 */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Koopi is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we discover that a child under 18 has provided us with personal information, we will promptly delete it.
                </p>
              </div>

              {/* Section 9 */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure that appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
                </p>
              </div>

              {/* Section 10 */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last updated" date.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Your continued use of Koopi after such modifications constitutes your acceptance of the updated Privacy Policy.
                </p>
              </div>

              {/* Section 11 */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-100 rounded-xl">
                  <p className="text-gray-700"><strong>Email:</strong> privacy@koopi.lk</p>
                  <p className="text-gray-700 mt-2"><strong>Data Protection Officer:</strong> dpo@koopi.lk</p>
                  <p className="text-gray-700 mt-2"><strong>Support:</strong> support@koopi.lk</p>
                </div>
              </div>

              {/* Acknowledgment */}
              <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">Acknowledgment</h3>
                <p className="text-sm text-gray-700">
                  By using Koopi, you acknowledge that you have read, understood, and agree to this Privacy Policy and our data practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
