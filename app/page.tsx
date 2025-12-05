import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative h-[80vh] flex items-center justify-center bg-[#F9FAFB]">
        <div className="absolute inset-0 overflow-hidden">
          {/* Placeholder for Hero Image */}
          <div className="w-full h-full bg-[#EAECEE] flex items-center justify-center text-gray-400">
            <span className="text-2xl">Hero Image Placeholder</span>
          </div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#2C3E50] mb-6 leading-tight">
            Fresh from <br/> Our Home to Yours
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-light">
            Handcrafted preserves, pickles, and dried goods made with love at 4050.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#2C3E50] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#34495E] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Shop Our Harvest
          </Link>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2C3E50] mb-12">
            Seasonal Favorites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden group">
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                    Applesauce
                 </div>
              </div>
              <h3 className="text-xl font-serif font-medium text-[#2C3E50]">Classic Applesauce</h3>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden group">
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                    Pickles
                 </div>
              </div>
              <h3 className="text-xl font-serif font-medium text-[#2C3E50]">Spicy Pickles</h3>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden group">
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                    Jams
                 </div>
              </div>
              <h3 className="text-xl font-serif font-medium text-[#2C3E50]">Fruit Jams</h3>
            </div>
          </div>
          <div className="mt-12">
             <Link href="/shop" className="text-[#2C3E50] font-medium underline hover:text-[#34495E] text-lg">
               View All Products
             </Link>
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="w-full py-20 bg-[#F3F4F6]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-5xl mx-auto">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2C3E50] mb-6">
                The Story of 4050
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                What started as a small family garden has grown into a passion for sharing the best of our harvest. 
                We believe in simple ingredients, traditional methods, and the joy of homemade food.
              </p>
              <Link
                href="/about"
                className="inline-block border-2 border-[#2C3E50] text-[#2C3E50] px-6 py-3 rounded-md font-medium hover:bg-[#2C3E50] hover:text-white transition-colors"
              >
                Read Our Story
              </Link>
            </div>
            <div className="w-full md:w-1/2 aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
              About Image
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
