import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";

type ProductPageProps = {
  params: {
    productId: string;
    storeName: string;
  };
};

async function getProductData(productId: string) {
  const productRef = doc(db, "products", productId);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    return null;
  }

  return productSnap.data();
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductData(params.productId);
  
  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} - Shop Online`,
    description: product.description || `Buy ${product.name} online`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductData(params.productId);

  if (!product) {
    notFound();
  }

  const imageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '/placeholder.png';

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
      {/* macOS-style background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-w-1 aspect-h-1 bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/30 shadow-2xl">
            <Image
              src={imageUrl}
              alt={product.name}
              layout="fill"
              objectFit="cover"
            />
          </div>

          {/* Product Info */}
          <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-2 text-3xl text-gray-900">LKR {product.price.toFixed(2)}</p>
            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-gray-700" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
            <div className="mt-10">
              <button
                type="submit"
                className="w-full bg-blue-500 border border-transparent rounded-full py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg active:scale-95"
              >
                Add to bag
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}