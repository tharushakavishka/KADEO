import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';
import { StorageService } from '../../services/storageService';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = React.useState(() => StorageService.getCategories());
  const [products, setProducts] = React.useState(() => StorageService.getProducts());

  React.useEffect(() => {
    const handleUpdate = () => {
      setCategories(StorageService.getCategories());
      setProducts(StorageService.getProducts());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('kadeo_categories_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('kadeo_categories_updated', handleUpdate);
    };
  }, []);

  const categoryImages: Record<string, string> = {
    'cat-apparel': '/src/assets/images/category_apparel_linen_1792347729400.jpg',
    'cat-skincare': '/src/assets/images/category_beauty_wellness_1792347729900.jpg',
    'cat-tech': '/src/assets/images/category_audio_tech_1792347731311.jpg',
    'cat-living': '/src/assets/images/category_handcrafted_living_1792347730298.jpg',
    'cat-gourmet': '/src/assets/images/marketplace_hero_lifestyle_1792347748759.jpg',
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#111113]">
      {/* Header */}
      <div className="border-b border-[#E4E4E7] bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E4E4E7] bg-[#FAFAF9] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-3">
            <Layers className="h-3.5 w-3.5 text-emerald-600" />
            <span>Marketplace Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F0F11]">
            Curated Categories
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#71717A] max-w-2xl leading-relaxed">
            Explore independent Sri Lankan ateliers organized by craft — handcrafted flax linen, botanical wellness, artisanal homeware, and audio tech.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(cat => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            const imageUrl = categoryImages[cat.id] || cat.imageUrl;

            return (
              <Link
                key={cat.id}
                to={`/search?category=${cat.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white hover:border-[#0F0F11] transition-all duration-300 shadow-luxury-xs hover:shadow-luxury-md focus-visible:outline-none"
              >
                {/* Category Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                  <img
                    src={imageUrl}
                    alt={cat.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-xs font-mono tracking-wider font-semibold">
                      {count} {count === 1 ? 'piece' : 'pieces'} available
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-1 flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0F0F11] group-hover:text-black">
                      {cat.name}
                    </h2>
                    <p className="mt-2 text-xs text-[#71717A] leading-relaxed line-clamp-2">
                      {cat.description || 'Curated Sri Lankan merchants and artisan creations.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-3.5 border-t border-[#F4F4F5] flex items-center justify-between text-xs font-bold text-[#0F0F11]">
                    <span>Browse collection</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
