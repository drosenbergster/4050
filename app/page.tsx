import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';
import ProductPreview from '@/app/components/product-preview';
import ImpactModal from '@/app/components/impact-modal';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Compact */}
      <section className="bg-[#FDF8F3] py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#5C4A3D] mb-3 leading-tight">
                Handpicked. Homemade. Heartfelt.
              </h1>
              <p className="text-sm md:text-base text-[#636E72] font-serif italic">
                In our Pacific Northwest backyard, the heritage trees provide. We turn what&apos;s given into something to share—and 100% of profits go to community causes.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-40 h-40 md:w-48 md:h-48">
                <div className="w-full h-full bg-[#F5EDE4] rounded-xl overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=300&h=300&fit=crop&q=80" 
                    alt="Heritage apple trees"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                    priority
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products - Right after hero */}
      <section className="bg-[#FDF8F3] pb-6">
        <div className="container mx-auto px-4">
          <ProductPreview />
        </div>
      </section>

      {/* Impact Banner */}
      <ImpactModal />

      {/* Local Pickup - Below products */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-[#FDF8F3] rounded-xl p-5 md:p-6 border border-[#E5DDD3]">
            <h2 className="text-xl font-serif font-bold text-[#5C4A3D] mb-3 text-center">
              Local Pickup
            </h2>
            <p className="text-sm text-[#636E72] text-center mb-5">
              For local friends and neighbors, we offer free pickup. Skip the shipping and get your goodies fresh!
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#E8F0EA] rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-[#4A7C59]" size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-[#5C4A3D] text-sm mb-0.5">Location</h3>
                  <p className="text-xs text-[#636E72]">
                    4050 HQ<br/>
                    <span className="text-[10px]">(Address provided upon order)</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#E8F0EA] rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="text-[#4A7C59]" size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-[#5C4A3D] text-sm mb-0.5">Hours</h3>
                  <p className="text-xs text-[#636E72]">
                    Flexible scheduling<br/>
                    <span className="text-[10px]">(We&apos;ll coordinate after purchase)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Products */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <span className="inline-block bg-[#4A7C59] text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full mb-1.5">
              Coming Soon
            </span>
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#5C4A3D]">
              Upcoming Products
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-w-3xl mx-auto">
            {[
              { name: 'Pear Butter' },
              { name: 'Strawberry Jam' },
              { name: 'Apple Pie Filling' },
              { name: 'Spiced Cider Jam' },
              { name: 'Pickled Beets' },
              { name: 'Dried Pear Chips' },
            ].map((product) => (
              <div key={product.name} className="bg-[#FDF8F3] rounded-lg p-2 border border-[#E5DDD3] text-center">
                <h3 className="text-[10px] sm:text-xs font-serif font-bold text-[#5C4A3D]">{product.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
