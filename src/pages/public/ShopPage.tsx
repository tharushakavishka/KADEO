import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { StorefrontView } from '../../components/storefront/StorefrontView';
import { KaveeStorefront } from '../../components/storefront/KaveeStorefront';
import { Store, ArrowLeft } from 'lucide-react';
import { setActiveStorefrontSlug } from '../../hooks/useActiveStorefront';

export const ShopPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [refreshCount, setRefreshCount] = React.useState(0);

  const shop = React.useMemo(() => {
    return slug ? StorageService.getShopBySlug(slug) : undefined;
  }, [slug, refreshCount]);

  React.useEffect(() => {
    if (shop?.slug) {
      setActiveStorefrontSlug(shop.slug);
    }
  }, [shop?.slug]);

  React.useEffect(() => {
    const handleStorage = () => setRefreshCount(c => c + 1);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('kadeo_shop_updated', handleStorage);
    window.addEventListener('kadeo_categories_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('kadeo_shop_updated', handleStorage);
      window.removeEventListener('kadeo_categories_updated', handleStorage);
    };
  }, []);

  // Dedicated pixel-perfect landing page for kavee-3 matching user provided design
  if (slug === 'kavee-3' || shop?.slug === 'kavee-3') {
    return (
      <div key={slug} className="page-transition min-h-screen">
        <KaveeStorefront shop={shop} />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
          <Store className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">Storefront Not Found</h1>
        <p className="mt-2 text-xs text-neutral-500 max-w-sm">
          No shop exists with the handle "{slug}". The seller may have changed their slug or deactivated their account.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Kadeo Marketplace</span>
        </Link>
      </div>
    );
  }

  const products = React.useMemo(() => {
    return StorageService.getProductsByShop(shop.id).filter(p => p.status === 'active');
  }, [shop.id, refreshCount]);

  const categories = React.useMemo(() => {
    return StorageService.getCategories();
  }, [refreshCount]);

  return (
    <div key={slug} className="page-transition min-h-screen">
      <StorefrontView
        shop={shop}
        products={products}
        categories={categories}
        onShopUpdate={() => setRefreshCount(c => c + 1)}
      />
    </div>
  );
};
