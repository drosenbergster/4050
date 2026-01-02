import { prisma } from '@/lib/server/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Leaf, AlertTriangle } from 'lucide-react';
import PurchaseOptions from './purchase-options';
import { getProductDetailsByName } from '@/lib/product-details';
import { STATIC_PRODUCTS } from '@/lib/static-data';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Product details with optional recipe/ingredient info
async function getProduct(id: string) {
  console.log('getProduct called with id:', id);
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        cogsRecipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    if (product) {
        console.log('Found product in DB:', product.name);
        return product;
    }
  } catch (e) {
    console.error('DB fetch failed:', e);
  }

  // Fallback to static data
  console.log('Checking static products. Count:', STATIC_PRODUCTS.length);
  const staticProduct = STATIC_PRODUCTS.find((p) => p.id === id);
  if (staticProduct) {
    console.log('Found static product:', staticProduct.name);
    return {
      ...staticProduct,
      cogsRecipe: null, // Static data doesn't have recipe relations
    };
  }

  console.log('Product not found in static either.');
  return null;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const details = getProductDetailsByName(product.name);
  const sizes = details?.sizes?.length
    ? details.sizes
    : [{ key: 'default', label: 'Regular', unitPrice: product.price }];

  // Extract ingredients from recipe if available
  const recipeIngredients = product.cogsRecipe?.ingredients?.map(
    (ri) => ri.ingredient.name
  ) || [];

  const displayIngredients = recipeIngredients.length > 0 
    ? recipeIngredients 
    : (details?.ingredients ?? []);

  return (
    <main className="bg-[#FDF8F3] min-h-screen py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Link */}
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-1.5 text-[#4A7C59] hover:text-[#3D6649] text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Shop
        </Link>

        <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Product Image */}
            <div className="relative aspect-square bg-[#F5EDE4]">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8B7355] font-serif text-4xl opacity-20">
                  4050
                </div>
              )}
              {!product.isAvailable && (
                <div className="absolute inset-0 bg-[#FDF8F3]/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[#5C4A3D] text-sm font-bold uppercase tracking-wider border-y border-[#5C4A3D] py-2 px-4">
                    Currently Unavailable
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 md:p-8 flex flex-col">
              <div className="flex-grow">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#5C4A3D] mb-2">
                  {product.name}
                </h1>
                
                <p className="text-[#636E72] font-serif italic mb-6">
                  {product.description}
                </p>

                {/* Purchase Options */}
                <div className="mb-6">
                  <PurchaseOptions product={product} sizes={sizes} disabled={!product.isAvailable} />
                </div>

                {/* Ingredients */}
                {displayIngredients.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-[#5C4A3D] uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Leaf size={14} className="text-[#4A7C59]" />
                      Ingredients
                    </h2>
                    <p className="text-sm text-[#636E72]">
                      {displayIngredients.join(', ')}
                    </p>
                  </div>
                )}

                {/* Allergen Info */}
                {details?.allergens?.length ? (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-[#5C4A3D] uppercase tracking-wide mb-3 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-600" />
                      Allergen Information
                    </h2>
                    <p className="text-sm text-[#636E72]">
                      Contains: {details.allergens.join(', ')}
                    </p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="text-xs text-[#8B7355] bg-[#F5EDE4] rounded-lg px-3 py-2 inline-block">
                      ✓ No common allergens
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-[#E5DDD3] p-4 text-center">
            <div className="text-[#4A7C59] font-bold text-sm mb-1">Handmade</div>
            <div className="text-xs text-[#636E72]">Small batch, made with care</div>
          </div>
          <div className="bg-white rounded-lg border border-[#E5DDD3] p-4 text-center">
            <div className="text-[#4A7C59] font-bold text-sm mb-1">Local Pickup</div>
            <div className="text-xs text-[#636E72]">Free pickup available</div>
          </div>
          <div className="bg-white rounded-lg border border-[#E5DDD3] p-4 text-center">
            <div className="text-[#4A7C59] font-bold text-sm mb-1">100% to Community</div>
            <div className="text-xs text-[#636E72]">All profits donated</div>
          </div>
        </div>
      </div>
    </main>
  );
}

