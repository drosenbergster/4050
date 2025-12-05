import { DollarSign, Building2, Home as HomeIcon, Heart, Users, Sprout } from 'lucide-react';

export default function ImpactPage() {
  return (
    <main className="bg-[#FDF8F3]">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#5C4A3D] mb-6">
              Our Community Impact
            </h1>
            <p className="text-xl text-[#636E72] max-w-2xl mx-auto">
              Every purchase makes a difference. Here&apos;s how we&apos;ve helped our community together.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-[#FDF8F3] rounded-2xl p-8 text-center border border-[#E5DDD3]">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-[#4A7C59]" size={28} />
              </div>
              <div className="text-5xl font-bold text-[#4A7C59] mb-2">$45,000+</div>
              <p className="text-[#636E72] font-medium">Raised for Community</p>
            </div>
            <div className="bg-[#FDF8F3] rounded-2xl p-8 text-center border border-[#E5DDD3]">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-[#4A7C59]" size={28} />
              </div>
              <div className="text-5xl font-bold text-[#4A7C59] mb-2">12</div>
              <p className="text-[#636E72] font-medium">Non-Profits Supported</p>
            </div>
            <div className="bg-[#FDF8F3] rounded-2xl p-8 text-center border border-[#E5DDD3]">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="text-[#4A7C59]" size={28} />
              </div>
              <div className="text-5xl font-bold text-[#4A7C59] mb-2">500+</div>
              <p className="text-[#636E72] font-medium">Families Helped</p>
            </div>
          </div>
        </div>
      </section>

      {/* Where Money Goes */}
      <section className="py-16 md:py-24 bg-[#FDF8F3]">
        <div className="container mx-auto px-4">
          <div className="bg-[#4A7C59] rounded-2xl p-8 md:p-12 text-center text-white max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">Where Your Money Goes</h2>
            <div className="text-7xl font-bold mb-6">100%</div>
            <p className="text-lg opacity-90">
              Every penny of profit goes directly to supporting local food banks, community gardens, 
              youth programs, and families in need. We keep our costs low and our impact high.
            </p>
          </div>

          {/* Impact Areas */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 text-center border border-[#E5DDD3]">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-[#4A7C59]" size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-3">Food Security</h3>
              <p className="text-[#636E72]">
                Supporting local food banks and meal programs to ensure no family goes hungry.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center border border-[#E5DDD3]">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Sprout className="text-[#4A7C59]" size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-3">Community Gardens</h3>
              <p className="text-[#636E72]">
                Funding tools, seeds, and education for neighborhood gardens that bring people together.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center border border-[#E5DDD3]">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-[#4A7C59]" size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-3">Youth Programs</h3>
              <p className="text-[#636E72]">
                Investing in after-school programs, cooking classes, and educational opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-serif font-bold text-[#5C4A3D] mb-12 text-center">
            Stories from Our Community
          </h2>
          
          <div className="space-y-8">
            <div className="bg-[#FDF8F3] rounded-2xl p-8 border border-[#E5DDD3]">
              <p className="text-lg text-[#636E72] italic mb-4">
                &quot;Thanks to 4050&apos;s support, our food bank was able to serve an additional 150 families 
                this winter. Their contribution means more than they know.&quot;
              </p>
              <p className="text-sm text-[#4A7C59] font-medium">
                — Sarah Johnson, Local Food Bank Director
              </p>
            </div>

            <div className="bg-[#FDF8F3] rounded-2xl p-8 border border-[#E5DDD3]">
              <p className="text-lg text-[#636E72] italic mb-4">
                &quot;The community garden grant from 4050 helped us purchase raised beds and organic soil. 
                Now 20 families are growing their own vegetables together!&quot;
              </p>
              <p className="text-sm text-[#4A7C59] font-medium">
                — Marcus Chen, Garden Coordinator
              </p>
            </div>

            <div className="bg-[#FDF8F3] rounded-2xl p-8 border border-[#E5DDD3]">
              <p className="text-lg text-[#636E72] italic mb-4">
                &quot;Our after-school cooking program wouldn&apos;t exist without 4050. Kids are learning 
                life skills and eating healthier. It&apos;s truly transformative.&quot;
              </p>
              <p className="text-sm text-[#4A7C59] font-medium">
                — Jennifer Martinez, Youth Program Director
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Organizations */}
      <section className="py-16 md:py-24 bg-[#FDF8F3]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-[#5C4A3D] mb-12">
            Our Partner Organizations
          </h2>
          <p className="text-[#636E72] mb-8 max-w-2xl mx-auto">
            We&apos;re proud to support these local non-profits making a real difference in our community.
          </p>
          <div className="text-sm text-[#636E72] italic">
            Partner list coming soon
          </div>
        </div>
      </section>
    </main>
  );
}

