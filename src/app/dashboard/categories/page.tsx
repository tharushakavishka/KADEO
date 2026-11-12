import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CategoryManager } from "@/components/dashboard/CategoryManager";
import { Layers, Package, CheckCircle2 } from "lucide-react";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!shop) redirect("/dashboard/new-store");

  const { data: categories } = await supabase
    .from("categories")
    .select("*, products:products(count)")
    .eq("shop_id", shop.id)
    .order("sort_order", { ascending: true });

  const catList = categories || [];
  const totalCategories = catList.length;
  const categorizedProducts = catList.reduce((acc: number, c: any) => {
    const pCount = c.products?.[0]?.count ?? 0;
    return acc + pCount;
  }, 0);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER SECTION */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-1">
        <div className="space-y-1 z-10">
          <span className="text-[11px] font-extrabold text-[#00c982] uppercase tracking-wider block">
            CATALOG MANAGEMENT
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Product Categories
            </h1>
            <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-bold bg-[#d1fae5] text-[#065f46]">
              {totalCategories}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Organize your shop products into clean, browsable categories for your customers.
          </p>
        </div>
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 flex items-center gap-4 transition hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-700 block">Total Categories</span>
            <span className="text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
              {totalCategories}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 flex items-center gap-4 transition hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-700 block">Categorized Products</span>
            <span className="text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
              {categorizedProducts}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 flex items-center gap-4 transition hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-700 block">Active Status</span>
            <span className="text-base font-black text-slate-900 tracking-tight block mt-1">
              Live on Storefront
            </span>
          </div>
        </div>
      </div>

      <CategoryManager initialCategories={catList} />
    </div>
  );
}
