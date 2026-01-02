import { Heart, Leaf, Users } from 'lucide-react';
import Image from 'next/image';
import ImpactModal from '@/app/components/impact-modal';

export default function AboutPage() {
  return (
    <main className="bg-[#FDF8F3]">
      {/* Hero Section */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#5C4A3D] mb-4">
              Our Story
            </h1>
            <p className="text-base md:text-lg text-[#636E72] max-w-2xl mx-auto italic font-serif">
              The garden doesn&apos;t have a schedule. It just provides. 4050 is our way of making sure none of that generosity goes to waste.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-12 max-w-4xl mx-auto">
            <div className="relative aspect-video bg-[#F5EDE4] rounded-xl overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=400&fit=crop&q=80" 
                alt="Heritage apple trees at 4050"
                width={600}
                height={400}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="space-y-4">
              <p className="text-[#636E72] leading-relaxed">
                In our Pacific Northwest backyard, two heritage apple trees set the pace for our lives. What started as sharing homemade applesauce with neighbors has grown into a mission: bringing comfort food to your table while supporting our community.
              </p>
              <p className="text-[#636E72] leading-relaxed">
                Every jar represents traditional methods passed down through generations. When you choose 4050, you&apos;re not just buying preserves—you&apos;re choosing which part of our community to help flourish. 100% of profits go directly to local causes.
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-5 text-center border border-[#E5DDD3]">
              <div className="w-12 h-12 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="text-[#4A7C59]" size={22} />
              </div>
              <h3 className="text-base font-serif font-bold text-[#5C4A3D] mb-2">Made with Love</h3>
              <p className="text-sm text-[#636E72]">
                Each batch is carefully crafted by Ilene with traditional recipes.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-[#E5DDD3]">
              <div className="w-12 h-12 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-3">
                <Leaf className="text-[#4A7C59]" size={22} />
              </div>
              <h3 className="text-base font-serif font-bold text-[#5C4A3D] mb-2">Homegrown</h3>
              <p className="text-sm text-[#636E72]">
                All produce is grown locally with sustainable practices.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-[#E5DDD3]">
              <div className="w-12 h-12 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="text-[#4A7C59]" size={22} />
              </div>
              <h3 className="text-base font-serif font-bold text-[#5C4A3D] mb-2">Community First</h3>
              <p className="text-sm text-[#636E72]">
                100% of profits support local non-profits and families.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Banner */}
      <ImpactModal />
    </main>
  );
}
