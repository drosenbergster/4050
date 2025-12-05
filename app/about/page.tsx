import { Heart, Leaf, Users, MapPin, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="bg-[#FDF8F3]">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#5C4A3D] mb-6">
              Our Story
            </h1>
            <p className="text-xl text-[#636E72] max-w-2xl mx-auto">
              4050 began in a small kitchen with Ilene's passion for preserving traditions 
              and giving back to the community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative aspect-video bg-[#F5EDE4] rounded-2xl overflow-hidden">
              <img 
                src="https://placehold.co/600x400/F5EDE4/8B7355?text=Apple+Orchard" 
                alt="Large gently sloping backyard with heritage apple trees"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-6">
              <p className="text-lg text-[#636E72] leading-relaxed">
                What started as sharing homemade applesauce with neighbors has grown into a social enterprise 
                that brings comfort food to your table while making a real difference in our community.
              </p>
              <p className="text-lg text-[#636E72] leading-relaxed">
                Every jar represents hours of love, traditional methods passed down through generations, 
                and a commitment to supporting those in need. When you choose 4050, you're not just buying 
                preserves – you're investing in local families and causes.
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E5DDD3]">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-[#4A7C59]" size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-3">Made with Love</h3>
              <p className="text-[#636E72]">
                Each batch is carefully crafted by Ilene with traditional recipes and care.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E5DDD3]">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="text-[#4A7C59]" size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-3">Homegrown</h3>
              <p className="text-[#636E72]">
                All our produce is grown locally with sustainable, organic practices.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E5DDD3]">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-[#4A7C59]" size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-3">Community First</h3>
              <p className="text-[#636E72]">
                100% of profits support local non-profits and community initiatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Local Pickup Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-[#FDF8F3] rounded-2xl p-8 md:p-12 border border-[#E5DDD3]">
            <h2 className="text-3xl font-serif font-bold text-[#5C4A3D] mb-6 text-center">
              Local Pickup
            </h2>
            <p className="text-lg text-[#636E72] text-center mb-10">
              For our local friends and neighbors, we offer free pickup at our headquarters. 
              Skip the shipping and get your goodies fresh!
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E8F0EA] rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-[#4A7C59]" size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#5C4A3D] mb-2 text-lg">Location</h3>
                  <p className="text-[#636E72]">
                    4050 HQ<br/>
                    <span className="text-sm">(Exact address provided upon order confirmation)</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E8F0EA] rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="text-[#4A7C59]" size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#5C4A3D] mb-2 text-lg">Hours</h3>
                  <p className="text-[#636E72]">
                    Flexible scheduling<br/>
                    <span className="text-sm">(We will coordinate with you after purchase)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 100% Profits Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-[#4A7C59] rounded-2xl p-8 md:p-12 text-center text-white max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              Where Your Money Goes
            </h2>
            <div className="text-6xl md:text-7xl font-bold mb-4">100%</div>
            <p className="text-lg opacity-90 max-w-xl mx-auto">
              Every penny of profit goes directly to supporting local food banks, community gardens, 
              youth programs, and families in need. We keep our costs low and our impact high.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
