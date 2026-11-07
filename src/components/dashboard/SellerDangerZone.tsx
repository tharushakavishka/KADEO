"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { serverSellerDeleteAccount } from "@/features/account/actions";

export function SellerDangerZone({
  shopName,
  shopSlug,
}: {
  shopName: string;
  shopSlug: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (confirmInput.trim().toLowerCase() !== "delete my account") {
      setError('Please type exactly "delete my account" to confirm.');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const res = await serverSellerDeleteAccount();
      if (!res.success) {
        setError(res.error || "Failed to delete account. Please try again.");
        setIsDeleting(false);
      }
      // If success, server action redirects to /login?deleted=true
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="bg-white border border-rose-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-zinc-900">Danger Zone</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-rose-100">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Delete Store & Seller Account
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                Permanently delete your store ({shopName}), product catalog, orders, and your account profile. This action cannot be undone.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setModalOpen(true);
                setConfirmInput("");
                setError(null);
              }}
              className="py-2 px-4 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs shadow-2xs transition shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isDeleting && setModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900">
                  Delete Your Account Permanently?
                </h3>
                <p className="text-xs text-zinc-500">
                  Irreversible action. All your store data will be deleted immediately.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 text-xs text-rose-900 space-y-1.5">
              <p className="font-semibold">
                This will permanently delete:
              </p>
              <ul className="list-disc list-inside text-[11px] text-rose-800 space-y-0.5">
                <li>Your store <span className="font-bold underline">{shopName}</span> (/shop/{shopSlug})</li>
                <li>All products, categories, images, and prices</li>
                <li>Your orders, payments, and customer contacts</li>
                <li>Your seller profile and access</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">
                To confirm, type <span className="font-mono text-rose-600 font-bold">delete my account</span> below:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="delete my account"
                disabled={isDeleting}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {error}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || confirmInput.trim().toLowerCase() !== "delete my account"}
                onClick={handleDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Everything Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
