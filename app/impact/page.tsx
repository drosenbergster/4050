'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sprout, 
  ArrowRight, 
  Heart, 
  Leaf,
  ExternalLink,
  Send,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

// Organization interface matching the API response
interface Organization {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: 'food' | 'garden' | 'youth' | 'community';
  website?: string;
  imageUrl?: string;
}

// Category labels for display
const CATEGORY_LABELS: Record<Organization['category'], string> = {
  food: 'Food Security',
  garden: 'Community Gardens',
  youth: 'Youth Programs',
  community: 'Community Support',
};

export default function ImpactPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [suggestionForm, setSuggestionForm] = useState({
    orgName: '',
    website: '',
    missionDescription: '',
    reason: '',
    yourName: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch active organizations on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await fetch('/api/organizations/active');
        if (res.ok) {
          const data = await res.json();
          setOrganizations(data);
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setIsLoadingOrgs(false);
      }
    };
    fetchOrganizations();
  }, []);

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const res = await fetch('/api/organizations/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: suggestionForm.orgName,
          website: suggestionForm.website || null,
          missionDescription: suggestionForm.missionDescription,
          reason: suggestionForm.reason,
          nominatorName: suggestionForm.yourName || null,
          nominatorEmail: suggestionForm.email || null,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        setSuggestionForm({ orgName: '', website: '', missionDescription: '', reason: '', yourName: '', email: '' });
      } else {
        const data = await res.json();
        setSubmitError(data.error || 'Failed to submit nomination');
      }
    } catch (error) {
      console.error('Failed to submit nomination:', error);
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[#FDF8F3]">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block text-[#4A7C59] font-medium text-sm uppercase tracking-wider mb-4">
              Together We Grow
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#5C4A3D] mb-6">
              Planting Seeds of Kindness
            </h1>
            <p className="text-xl text-[#636E72] mb-6">
              This is something new we&apos;re trying. When you buy our homemade goods, you&apos;re not just getting something delicious—you get to choose where our profits go.
            </p>
            <div className="bg-[#FDF8F3] rounded-2xl p-6 md:p-8 border border-[#E5DDD3] text-left">
              <h2 className="font-serif font-bold text-[#5C4A3D] text-lg mb-3 flex items-center gap-2">
                <Sprout className="text-[#4A7C59]" size={20} />
                Our Vision
              </h2>
              <p className="text-[#636E72] mb-4">
                Ilene started 4050 with a simple idea: what if every jar of jam or apple butter could do something good for the community? We&apos;re calling it &quot;Seeds of Kindness&quot;—a way to let our customers help decide where 100% of our profits go.
              </p>
              <p className="text-[#636E72]">
                Twice a year—in November after the fall harvest, and again in May—we&apos;ll tally up everyone&apos;s seeds and distribute profits to local organizations based on what our community chose. We&apos;re just getting started, and we&apos;re excited to see where this grows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Seeds Work */}
      <section className="py-16 md:py-24 bg-[#FDF8F3]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#E8F0EA] text-[#4A7C59] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Leaf size={16} />
                How It Works
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#5C4A3D] mb-4">
                How Seeds Work
              </h2>
              <p className="text-lg text-[#636E72] max-w-2xl mx-auto">
                When you shop at 4050, you&apos;re not just buying homemade goods—you&apos;re helping direct where 100% of our profits go.
              </p>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#4A7C59] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  1
                </div>
                <h3 className="font-serif font-bold text-[#5C4A3D] text-lg mb-2">You Shop</h3>
                <p className="text-[#636E72] text-sm">
                  Every purchase earns seeds. You get 1 seed automatically, plus 1 more for every $10 you spend.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#4A7C59] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  2
                </div>
                <h3 className="font-serif font-bold text-[#5C4A3D] text-lg mb-2">You Choose</h3>
                <p className="text-[#636E72] text-sm">
                  At checkout, you pick which organization you&apos;d like your seeds to support this season.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#4A7C59] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  3
                </div>
                <h3 className="font-serif font-bold text-[#5C4A3D] text-lg mb-2">We Distribute</h3>
                <p className="text-[#636E72] text-sm">
                  In November and May, we tally all seeds and distribute profits proportionally to each organization.
                </p>
              </div>
            </div>

            {/* Example Box */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5DDD3] shadow-sm">
              <h4 className="font-serif font-bold text-[#5C4A3D] mb-4 flex items-center gap-2">
                <Sprout className="text-[#4A7C59]" size={20} />
                Example: How Your Seeds Add Up
              </h4>
              <p className="text-[#636E72] mb-4">
                Say this season, our community plants <strong className="text-[#5C4A3D]">1,000 seeds</strong> total, and we have <strong className="text-[#5C4A3D]">$3,000</strong> in profits to share:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#FDF8F3] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#636E72]">Helping Hands Food Bank</span>
                    <span className="text-sm font-bold text-[#4A7C59]">450 seeds (45%)</span>
                  </div>
                  <div className="w-full bg-[#E5DDD3] rounded-full h-2 mb-2">
                    <div className="bg-[#4A7C59] h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="text-right text-sm font-bold text-[#5C4A3D]">Receives $1,350</div>
                </div>
                <div className="bg-[#FDF8F3] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#636E72]">Greenway Community Gardens</span>
                    <span className="text-sm font-bold text-[#4A7C59]">300 seeds (30%)</span>
                  </div>
                  <div className="w-full bg-[#E5DDD3] rounded-full h-2 mb-2">
                    <div className="bg-[#4A7C59] h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <div className="text-right text-sm font-bold text-[#5C4A3D]">Receives $900</div>
                </div>
                <div className="bg-[#FDF8F3] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#636E72]">Sprouts Youth Program</span>
                    <span className="text-sm font-bold text-[#4A7C59]">150 seeds (15%)</span>
                  </div>
                  <div className="w-full bg-[#E5DDD3] rounded-full h-2 mb-2">
                    <div className="bg-[#4A7C59] h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <div className="text-right text-sm font-bold text-[#5C4A3D]">Receives $450</div>
                </div>
                <div className="bg-[#FDF8F3] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#636E72]">Neighbors Helping Neighbors</span>
                    <span className="text-sm font-bold text-[#4A7C59]">100 seeds (10%)</span>
                  </div>
                  <div className="w-full bg-[#E5DDD3] rounded-full h-2 mb-2">
                    <div className="bg-[#4A7C59] h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <div className="text-right text-sm font-bold text-[#5C4A3D]">Receives $300</div>
                </div>
              </div>
              <p className="text-sm text-[#8B7355] italic mt-4 text-center">
                Your seeds are your voice. The more our community plants toward a cause, the more support it receives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* This Quarter's Partners */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#E8F0EA] text-[#4A7C59] text-sm font-medium px-4 py-2 rounded-full mb-4">
              This Season&apos;s Partners
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#5C4A3D] mb-4">
              Our Partner Organizations
            </h2>
            <p className="text-lg text-[#636E72] max-w-2xl mx-auto">
              These are the organizations you can support with your seeds this season. Each one is doing meaningful work in our community, and we rotate partners to spread the love.
            </p>
          </div>

          {isLoadingOrgs ? (
            <div className="text-center py-12 text-gray-500">Loading organizations...</div>
          ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {organizations.map((org) => (
              <div 
                key={org.id}
                className="bg-[#FDF8F3] rounded-2xl overflow-hidden border border-[#E5DDD3] hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 bg-[#E5DDD3]">
                  <Image
                    src={org.imageUrl || 'https://placehold.co/400x300/E5DDD3/8B7355?text=Organization'}
                    alt={org.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-[#4A7C59] text-xs font-bold px-3 py-1 rounded-full">
                      {CATEGORY_LABELS[org.category]}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-2">
                    {org.name}
                  </h3>
                  <p className="text-[#636E72] text-sm mb-4 leading-relaxed">
                    {org.description}
                  </p>
                  {org.website && (
                    <a 
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[#4A7C59] hover:text-[#3D6649] font-medium transition-colors"
                    >
                      Visit their website
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#4A7C59] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#3D6649] transition-all hover:-translate-y-0.5 shadow-md"
            >
              Shop & Plant Your Seeds
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Where Money Goes */}
      <section className="py-16 md:py-24 bg-[#FDF8F3]">
        <div className="container mx-auto px-4">
          <div className="bg-[#4A7C59] rounded-2xl p-8 md:p-12 text-center text-white max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-4">100% of Profits</h2>
            <p className="text-lg opacity-90 mb-6">
              Every penny of profit from 4050 goes directly to our partner organizations. We keep our costs low so our community impact stays high.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="opacity-75">No admin fees</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="opacity-75">No overhead skimming</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="opacity-75">Just community helping community</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Suggest an Organization */}
      <section className="py-16 md:py-24 bg-[#FDF8F3]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-[#F5EDE4] text-[#8B7355] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart size={16} />
                Have a Suggestion?
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#5C4A3D] mb-4">
                Nominate an Organization
              </h2>
              <p className="text-[#636E72]">
                Know a local organization making a difference? We&apos;d love to hear about them! 
                Our family reviews every nomination, and we add new partners each season. 
                We especially love organizations that are local to our community.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-white rounded-2xl p-8 border border-[#E5DDD3] text-center">
                <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-[#4A7C59]" size={32} />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-2">
                  Thank You!
                </h3>
                <p className="text-[#636E72] mb-6">
                  We&apos;ve received your nomination and will review it as a family. If it&apos;s a good fit, we&apos;ll add them to our partner pool for an upcoming season!
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-[#4A7C59] font-medium hover:underline"
                >
                  Nominate another organization
                </button>
              </div>
            ) : (
              <form onSubmit={handleSuggestionSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5DDD3] space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#5C4A3D] mb-2">
                    Organization Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={suggestionForm.orgName}
                    onChange={(e) => setSuggestionForm(prev => ({ ...prev, orgName: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] outline-none transition-all"
                    placeholder="e.g., Downtown Community Kitchen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5C4A3D] mb-2">
                    Their Website (optional)
                  </label>
                  <input
                    type="url"
                    value={suggestionForm.website}
                    onChange={(e) => setSuggestionForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5C4A3D] mb-2">
                    What do they do? <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={suggestionForm.missionDescription}
                    onChange={(e) => setSuggestionForm(prev => ({ ...prev, missionDescription: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] outline-none transition-all resize-none"
                    placeholder="Tell us about the organization's mission and what they do in the community..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5C4A3D] mb-2">
                    Why do you think they&apos;d be a good fit? <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={suggestionForm.reason}
                    onChange={(e) => setSuggestionForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] outline-none transition-all resize-none"
                    placeholder="Why would they be a great partner for 4050?"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5C4A3D] mb-2">
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      value={suggestionForm.yourName}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, yourName: e.target.value }))}
                      className="w-full px-4 py-3 border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5C4A3D] mb-2">
                      Your Email (optional)
                    </label>
                    <input
                      type="email"
                      value={suggestionForm.email}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <p className="text-xs text-[#8B7355] italic">
                  We&apos;ll only use your email to follow up if we have questions about your suggestion.
                </p>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#4A7C59] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#3D6649] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={18} />
                      Send Suggestion
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#5C4A3D] mb-4">
            Ready to Plant Some Seeds?
          </h2>
          <p className="text-[#636E72] mb-8 max-w-xl mx-auto">
            Every jar you buy is a vote for the community. Shop now and choose where your seeds grow.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#E67E22] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#D35400] transition-all hover:-translate-y-0.5 shadow-md"
          >
            Browse Our Products
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}
