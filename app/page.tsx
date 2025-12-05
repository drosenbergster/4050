import Link from 'next/link';
import Image from 'next/image';
import { Heart, Leaf, Users, DollarSign, Building2, Home as HomeIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section id="home" className="bg-[#FDF8F3] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <span className="text-[#4A7C59] font-medium text-sm uppercase tracking-wider">
                From Our Kitchen to Your Table
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#5C4A3D] mt-4 mb-6 leading-tight">
                Handpicked. Homemade. Heartfelt.
              </h1>
              <p className="text-lg text-[#636E72] mb-8 max-w-xl">
                Pure, simple ingredients grown in our backyard and preserved with generations of care. 
                Every jar you buy feeds a family, supports a cause, and connects our community—one delicious spoonful at a time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/shop"
                  className="bg-[#4A7C59] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#3D6649] transition-all hover:-translate-y-0.5 text-center"
                >
                  Shop Now
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-[#4A7C59] text-[#4A7C59] px-8 py-3 rounded-lg font-medium hover:bg-[#4A7C59] hover:text-white transition-all text-center"
                >
                  Our Story
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="w-full h-full bg-[#F5EDE4] rounded-2xl flex items-center justify-center overflow-hidden">
                  <Image 
                    src="https://placehold.co/500x500/F5EDE4/8B7355?text=Homemade+Jars" 
                    alt="Homemade applesauce jars"
                    width={500}
                    height={500}
                    className="w-full h-full object-cover rounded-2xl"
                    unoptimized
                  />
                </div>
                {/* Badge */}
                <div className="absolute bottom-4 right-4 bg-[#4A7C59] text-white px-4 py-3 rounded-xl shadow-lg">
                  <div className="text-sm font-medium">100% Profits to</div>
                  <div className="font-bold">Community Causes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#5C4A3D] mb-4">
              Our Story
            </h2>
            <p className="text-lg text-[#636E72] max-w-2xl mx-auto">
              4050 began in a small kitchen with Ilene&apos;s passion for preserving traditions and giving back to the community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative aspect-video bg-[#F5EDE4] rounded-2xl overflow-hidden">
              <Image 
                src="https://placehold.co/600x400/F5EDE4/8B7355?text=Apple+Orchard" 
                alt="Large gently sloping backyard with heritage apple trees"
                width={600}
                height={400}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="space-y-6">
              <p className="text-[#636E72] leading-relaxed">
                What started as sharing homemade applesauce with neighbors has grown into a social enterprise 
                that brings comfort food to your table while making a real difference in our community.
              </p>
              <p className="text-[#636E72] leading-relaxed">
                Every jar represents hours of love, traditional methods passed down through generations, 
                and a commitment to supporting those in need. When you choose 4050, you&apos;re not just buying 
                preserves – you&apos;re investing in local families and causes.
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#FDF8F3] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-[#4A7C59]" size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-3">Made with Love</h3>
              <p className="text-[#636E72]">
                Each batch is carefully crafted by Ilene with traditional recipes and care.
              </p>
            </div>
            <div className="bg-[#FDF8F3] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="text-[#4A7C59]" size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#5C4A3D] mb-3">Homegrown</h3>
              <p className="text-[#636E72]">
                All our produce is grown locally with sustainable, organic practices.
              </p>
            </div>
            <div className="bg-[#FDF8F3] rounded-2xl p-8 text-center">
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

      {/* Products Preview */}
      <section className="bg-[#FDF8F3] py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#5C4A3D] mb-4">
            Our Products
          </h2>
          <p className="text-lg text-[#636E72] max-w-2xl mx-auto mb-12">
            Each jar is handcrafted with care using traditional methods and the finest homegrown ingredients.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#4A7C59] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#3D6649] transition-all hover:-translate-y-0.5"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Community Impact Section */}
      <section id="impact" className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#5C4A3D] mb-4">
              Our Community Impact
            </h2>
            <p className="text-lg text-[#636E72] max-w-2xl mx-auto">
              Every purchase makes a difference. Here&apos;s how we&apos;ve helped our community together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-[#FDF8F3] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-[#4A7C59]" size={28} />
              </div>
              <div className="text-4xl font-bold text-[#4A7C59] mb-2">$45,000+</div>
              <p className="text-[#636E72]">Raised for Community</p>
            </div>
            <div className="bg-[#FDF8F3] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-[#4A7C59]" size={28} />
              </div>
              <div className="text-4xl font-bold text-[#4A7C59] mb-2">12</div>
              <p className="text-[#636E72]">Non-Profits Supported</p>
            </div>
            <div className="bg-[#FDF8F3] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-[#E8F0EA] rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="text-[#4A7C59]" size={28} />
              </div>
              <div className="text-4xl font-bold text-[#4A7C59] mb-2">500+</div>
              <p className="text-[#636E72]">Families Helped</p>
            </div>
          </div>

          <div className="bg-[#4A7C59] rounded-2xl p-8 md:p-12 text-center text-white max-w-3xl mx-auto">
            <h3 className="text-2xl font-serif font-bold mb-4">Where Your Money Goes</h3>
            <div className="text-6xl font-bold mb-4">100%</div>
            <p className="text-lg opacity-90 max-w-xl mx-auto">
              Every penny of profit goes directly to supporting local food banks, community gardens, 
              youth programs, and families in need. We keep our costs low and our impact high.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Products */}
      <section className="bg-[#FDF8F3] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#4A7C59] text-white text-sm font-medium px-4 py-1 rounded-full mb-4">
              Coming Soon
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#5C4A3D] mb-4">
              Upcoming Products
            </h2>
            <p className="text-lg text-[#636E72] max-w-2xl mx-auto">
              Ilene is always experimenting in the kitchen. Here&apos;s what we&apos;re working on next.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Pear Butter', desc: 'Silky smooth pear butter with a hint of vanilla' },
              { name: 'Strawberry Jam', desc: 'Classic strawberry jam from summer-fresh berries' },
              { name: 'Apple Pie Filling', desc: 'Ready-to-bake apple pie filling with traditional spices' },
              { name: 'Spiced Apple Cider Jam', desc: 'Warm spiced jam that captures the essence of fall' },
              { name: 'Pickled Beets', desc: 'Sweet and tangy pickled beets, perfect as a side' },
              { name: 'Dried Pear Chips', desc: 'Delicate pear chips, naturally sweet and crispy' },
            ].map((product) => (
              <div key={product.name} className="bg-white rounded-xl p-6 border border-[#E5DDD3]">
                <h3 className="font-serif font-bold text-[#5C4A3D] mb-2">{product.name}</h3>
                <p className="text-sm text-[#636E72]">{product.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
