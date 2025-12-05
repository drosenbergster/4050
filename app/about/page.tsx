export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2C3E50] mb-8 text-center">
        About 4050
      </h1>
      
      <div className="space-y-8 text-lg text-gray-600 leading-relaxed">
        <p>
          Welcome to 4050. We are a small, family-run operation dedicated to bringing you the freshest homegrown produce and homemade goods. 
          Our journey began in our backyard garden, where we discovered the simple joy of growing our own food and preserving the harvest.
        </p>
        
        <p>
          Everything we sell is made in small batches, ensuring the highest quality and attention to detail. 
          From our orchard apples turned into smooth applesauce to our garden cucumbers transformed into crisp pickles, 
          we take pride in every jar and bag we seal.
        </p>
        
        <div className="bg-[#F9FAFB] p-8 rounded-lg border border-gray-100 mt-12">
          <h2 className="text-2xl font-serif font-bold text-[#2C3E50] mb-4">
            Local Pickup
          </h2>
          <p className="mb-4">
            For our local friends and neighbors, we offer free pickup at our headquarters.
          </p>
          <div className="flex flex-col md:flex-row gap-8">
            <div>
              <h3 className="font-bold text-[#2C3E50] mb-2">Location</h3>
              <p>4050 HQ<br/>(Exact address provided upon order confirmation)</p>
            </div>
            <div>
              <h3 className="font-bold text-[#2C3E50] mb-2">Hours</h3>
              <p>TBD<br/>(We will coordinate with you after purchase)</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

