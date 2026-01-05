import { prisma } from '@/lib/server/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Leaf } from 'lucide-react';
import PurchaseOptions from './purchase-options';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Size type for the purchase options component
export interface ProductSizeOption {
  key: string;
  label: string;
  unitPrice: number;
  quantity: number;
  sizeOz: number;
}

// Fetch product flavor with all details
async function getProduct(id: string) {
  try {
    // First try to find as a ProductFlavor (new hierarchy)
    const flavor = await prisma.productFlavor.findUnique({
      where: { id },
      include: {
        category: true,
        sizes: {
          where: { isActive: true },
          orderBy: { sizeOz: 'asc' },
        },
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

    if (flavor) {
      return {
        id: flavor.id,
        name: flavor.name,
        fullName: flavor.name,
        categoryName: flavor.category.name,
        description: flavor.description || '',
        imageUrl: flavor.imageUrl || flavor.category.imageUrl || '',
        isAvailable: flavor.isAvailable,
        sizes: flavor.sizes.map((s) => ({
          key: s.sizeKey,
          label: s.sizeLabel,
          unitPrice: s.unitPrice,
          quantity: s.quantity,
          sizeOz: s.sizeOz,
        })),
        ingredients: flavor.cogsRecipe?.ingredients?.map((ri) => ri.ingredient.name) || [],
      };
    }

    // Fallback: Try legacy Product table
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { sizeOz: 'asc' },
        },
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
      return {
        id: product.id,
        name: product.name,
        fullName: product.name,
        categoryName: product.category || 'Other',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        isAvailable: product.isAvailable,
        sizes: product.variants?.length
          ? product.variants.map((v) => ({
              key: v.sizeKey,
              label: v.sizeLabel,
              unitPrice: v.unitPrice,
              quantity: v.quantity,
              sizeOz: v.sizeOz,
            }))
          : [{ key: 'default', label: 'Regular', unitPrice: product.price, quantity: product.quantity, sizeOz: 16 }],
        ingredients: product.cogsRecipe?.ingredients?.map((ri) => ri.ingredient.name) || [],
      };
    }

    return null;
  } catch (e) {
    console.error('DB fetch failed:', e);
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Filter to only show in-stock sizes
  const inStockSizes = product.sizes.filter((s) => s.quantity > 0);

  // Determine if product is purchasable
  const canPurchase = product.isAvailable && inStockSizes.length > 0;

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
                  alt={product.fullName}
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
              {!canPurchase && (
                <div className="absolute inset-0 bg-[#FDF8F3]/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[#5C4A3D] text-sm font-bold uppercase tracking-wider border-y border-[#5C4A3D] py-2 px-4">
                    {!product.isAvailable ? 'Currently Unavailable' : 'Out of Stock'}
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 md:p-8 flex flex-col">
              <div className="flex-grow">
                {/* Category Badge */}
                <div className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">
                  {product.categoryName}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#5C4A3D] mb-2">
                  {product.fullName}
                </h1>
                
                {product.description && (
                  <p className="text-[#636E72] font-serif italic mb-6">
                    {product.description}
                  </p>
                )}

                {/* Purchase Options */}
                <div className="mb-6">
                  <PurchaseOptions 
                    product={product} 
                    sizes={inStockSizes} 
                    disabled={!canPurchase} 
                  />
                </div>

                {/* Ingredients */}
                {product.ingredients.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-[#5C4A3D] uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Leaf size={14} className="text-[#4A7C59]" />
                      Ingredients
                    </h2>
                    <p className="text-sm text-[#636E72]">
                      {product.ingredients.join(', ')}
                    </p>
                  </div>
                )}

                {/* Allergen Info - No common allergens for preserves */}
                <div className="mb-6">
                  <div className="text-xs text-[#8B7355] bg-[#F5EDE4] rounded-lg px-3 py-2 inline-block">
                    ✓ No common allergens
                  </div>
                </div>
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

