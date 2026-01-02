import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Mail, Trash2, Cookie } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | 4050',
  description: 'How 4050 collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="bg-[#FDF8F3] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#4A7C59] hover:text-[#3D6649] transition-colors text-sm font-medium mb-6"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#4A7C59] rounded-full flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#5C4A3D]">
              Privacy Policy
            </h1>
          </div>
          
          <p className="text-[#636E72] font-serif italic">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5DDD3] p-8 md:p-12 space-y-10">
          
          {/* Introduction */}
          <section>
            <p className="text-[#636E72] leading-relaxed text-lg">
              At 4050, we believe in transparency—just like our homemade recipes. This Privacy Policy 
              explains how we collect, use, and protect your personal information when you visit our 
              website or make a purchase. We&apos;re a small family operation, and we treat your data 
              with the same care we put into every jar.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#E8F0EA] rounded-lg text-[#4A7C59]">
                <Eye size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#5C4A3D]">Information We Collect</h2>
            </div>
            
            <div className="space-y-4 text-[#636E72] leading-relaxed">
              <p>When you place an order or interact with our website, we may collect:</p>
              
              <div className="bg-[#FDF8F3] rounded-xl p-6 space-y-3">
                <div className="flex gap-3">
                  <span className="text-[#4A7C59] font-bold">•</span>
                  <div>
                    <span className="font-medium text-[#5C4A3D]">Contact Information:</span> Name, email address, phone number
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#4A7C59] font-bold">•</span>
                  <div>
                    <span className="font-medium text-[#5C4A3D]">Shipping Information:</span> Delivery address (if you choose shipping)
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#4A7C59] font-bold">•</span>
                  <div>
                    <span className="font-medium text-[#5C4A3D]">Order Details:</span> Products purchased, order history, cause preferences
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#4A7C59] font-bold">•</span>
                  <div>
                    <span className="font-medium text-[#5C4A3D]">Payment Information:</span> Processed securely by Stripe (we never see your full card number)
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#E8F0EA] rounded-lg text-[#4A7C59]">
                <Lock size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#5C4A3D]">How We Use Your Information</h2>
            </div>
            
            <div className="space-y-4 text-[#636E72] leading-relaxed">
              <p>We use your information to:</p>
              
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">✓</span>
                  Process and fulfill your orders
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">✓</span>
                  Send order confirmations and shipping updates
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">✓</span>
                  Coordinate local pickup arrangements
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">✓</span>
                  Track community impact and seed donations to your chosen causes
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">✓</span>
                  Respond to your questions or concerns
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">✓</span>
                  Improve our website and products
                </li>
              </ul>
              
              <p className="mt-4 font-medium text-[#5C4A3D]">
                We do not sell, rent, or share your personal information with third parties for marketing purposes.
              </p>
            </div>
          </section>

          {/* Payment Security */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#E8F0EA] rounded-lg text-[#4A7C59]">
                <Shield size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#5C4A3D]">Payment Security</h2>
            </div>
            
            <div className="space-y-4 text-[#636E72] leading-relaxed">
              <p>
                All payments are processed securely through <strong className="text-[#5C4A3D]">Stripe</strong>, 
                a leading payment processor trusted by millions of businesses worldwide. When you enter your 
                payment information:
              </p>
              
              <div className="bg-[#FDF8F3] rounded-xl p-6 space-y-3">
                <div className="flex gap-3">
                  <span className="text-[#4A7C59] font-bold">•</span>
                  <span>Your card details are encrypted and sent directly to Stripe</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#4A7C59] font-bold">•</span>
                  <span>We never store your full credit card number on our servers</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#4A7C59] font-bold">•</span>
                  <span>All transactions use industry-standard SSL/TLS encryption</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#4A7C59] font-bold">•</span>
                  <span>Stripe is PCI-DSS Level 1 certified (the highest level of security)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#E8F0EA] rounded-lg text-[#4A7C59]">
                <Cookie size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#5C4A3D]">Cookies</h2>
            </div>
            
            <div className="space-y-4 text-[#636E72] leading-relaxed">
              <p>
                We use essential cookies to make our website work properly. These help us:
              </p>
              
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">•</span>
                  Remember items in your shopping basket
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">•</span>
                  Keep you signed in during checkout
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">•</span>
                  Process payments securely
                </li>
              </ul>
              
              <p>
                We do not use tracking cookies for advertising purposes. Your browsing stays between us.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#E8F0EA] rounded-lg text-[#4A7C59]">
                <Trash2 size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#5C4A3D]">Your Rights</h2>
            </div>
            
            <div className="space-y-4 text-[#636E72] leading-relaxed">
              <p>You have the right to:</p>
              
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">•</span>
                  Request access to your personal data
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">•</span>
                  Request correction of inaccurate data
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">•</span>
                  Request deletion of your data (subject to legal requirements)
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4A7C59]">•</span>
                  Opt out of any marketing communications
                </li>
              </ul>
              
              <p>
                To exercise any of these rights, simply contact us at the email below.
              </p>
            </div>
          </section>

          {/* Contact Us */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#E8F0EA] rounded-lg text-[#4A7C59]">
                <Mail size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#5C4A3D]">Contact Us</h2>
            </div>
            
            <div className="space-y-4 text-[#636E72] leading-relaxed">
              <p>
                If you have any questions about this Privacy Policy or how we handle your data, 
                please reach out:
              </p>
              
              <div className="bg-[#4A7C59] text-white rounded-xl p-6">
                <p className="font-medium mb-2">4050 Privacy Inquiries</p>
                <a 
                  href="mailto:hello@4050goods.com" 
                  className="text-white/90 hover:text-white underline"
                >
                  hello@4050goods.com
                </a>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section className="border-t border-[#E5DDD3] pt-8">
            <p className="text-[#636E72] text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be posted on this 
              page with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </section>
        </div>

        {/* Back to Shop CTA */}
        <div className="mt-12 text-center">
          <Link 
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#4A7C59] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#3D6649] transition-all hover:-translate-y-0.5"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

