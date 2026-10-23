import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';
import { Customer } from '../../types';
import { Users, Search, MessageCircle, FileText, Check, X } from 'lucide-react';

export const SellerCustomersPage: React.FC = () => {
  const { currentShop } = useAuth();
  const { isDark } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>(() =>
    currentShop ? StorageService.getCustomers(currentShop.id) : []
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteCustomer, setEditingNoteCustomer] = useState<Customer | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const refreshCustomers = () => {
    if (currentShop) {
      setCustomers(StorageService.getCustomers(currentShop.id));
    }
  };

  if (!currentShop) {
    return <div className="text-center py-16 text-xs text-neutral-400">Shop not found.</div>;
  }

  const filtered = customers.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  const handleOpenNote = (c: Customer) => {
    setEditingNoteCustomer(c);
    setNoteContent(c.notes || '');
    setSavedSuccess(false);
  };

  const handleSaveNote = () => {
    if (!editingNoteCustomer) return;
    StorageService.saveCustomerNote(currentShop.id, editingNoteCustomer.phone, noteContent);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditingNoteCustomer(null);
      refreshCustomers();
    }, 800);
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('94')
      ? cleanPhone
      : `94${cleanPhone.replace(/^0+/, '')}`;

    const text = encodeURIComponent(
      `Hello ${name}! Greetings from ${currentShop.name}. Thank you for shopping with us on Kadeo.`
    );
    window.open(`https://wa.me/${phoneWithCode}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b transition-colors ${
          isDark ? 'border-white/10' : 'border-[#E4E4E7]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full font-bold ${
                isDark
                  ? 'bg-white/10 text-neutral-300 border border-white/10'
                  : 'bg-neutral-100 text-[#0F0F11] border border-neutral-200'
              }`}
            >
              Clientele Roster
            </span>
            <span
              className={`text-[11px] font-semibold ${
                isDark ? 'text-neutral-400' : 'text-[#71717A]'
              }`}
            >
              {customers.length} verified buyers
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Customer Directory & CRM
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
            Unified buyer profiles derived from incoming WhatsApp orders with lifetime spend metrics.
          </p>
        </div>
      </div>

      {/* Search */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isDark
            ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
            : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
        }`}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search buyers by name or phone..."
            className={`w-full rounded-2xl border py-2.5 pl-10 pr-3.5 text-xs transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] placeholder-neutral-400 focus:border-[#0F0F11] focus:bg-white focus:outline-none'
            }`}
          />
        </div>
      </div>

      {/* Customer Table */}
      <div
        className={`rounded-3xl border overflow-hidden transition-all ${
          isDark
            ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
            : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
        }`}
      >
        {filtered.length === 0 ? (
          <div
            className={`py-20 text-center space-y-3 ${
              isDark ? 'text-neutral-400' : 'text-[#71717A]'
            }`}
          >
            <Users className="h-10 w-10 mx-auto text-neutral-400/60" />
            <h3 className="text-sm font-bold">No customer records yet</h3>
            <p className="text-xs max-w-sm mx-auto">
              When buyers submit orders to your boutique, their records will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b font-semibold ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-neutral-400'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#71717A]'
                }`}
              >
                <tr>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Total Orders</th>
                  <th className="py-4 px-6">Lifetime Spend</th>
                  <th className="py-4 px-6">Latest Order</th>
                  <th className="py-4 px-6">Private Notes</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-white/5' : 'divide-[#F4F4F5]'
                }`}
              >
                {filtered.map(cust => (
                  <tr
                    key={cust.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <p className="font-bold">{cust.name}</p>
                      <p
                        className={`text-[11px] font-mono ${
                          isDark ? 'text-neutral-400' : 'text-[#71717A]'
                        }`}
                      >
                        {cust.phone}
                      </p>
                    </td>

                    <td className="py-4 px-6 font-bold tabular-nums">
                      {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                    </td>

                    <td className="py-4 px-6 font-extrabold tabular-nums">
                      {StorageService.formatLKR(cust.totalSpent)}
                    </td>

                    <td
                      className={`py-4 px-6 whitespace-nowrap ${
                        isDark ? 'text-neutral-400' : 'text-[#71717A]'
                      }`}
                    >
                      {new Date(cust.lastOrderDate).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6">
                      {cust.notes ? (
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full truncate max-w-[180px] block ${
                            isDark
                              ? 'bg-white/10 text-neutral-200'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {cust.notes}
                        </span>
                      ) : (
                        <span className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          No notes
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenNote(cust)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            isDark
                              ? 'border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                              : 'border-[#E4E4E7] bg-white text-[#71717A] hover:text-[#0F0F11]'
                          }`}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Notes</span>
                        </button>

                        <button
                          onClick={() => openWhatsApp(cust.phone, cust.name)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                            isDark
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note Modal */}
      {editingNoteCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 space-y-4 anim-slide-bottom shadow-2xl ${
              isDark
                ? 'bg-[#15151D] border-white/15 text-white'
                : 'bg-white border-[#E4E4E7] text-[#0F0F11]'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold tracking-tight">
                Client Dossier: {editingNoteCustomer.name}
              </h3>
              <button
                onClick={() => setEditingNoteCustomer(null)}
                className={`p-1.5 rounded-xl transition-colors ${
                  isDark ? 'text-neutral-400 hover:text-white' : 'text-[#71717A] hover:text-[#0F0F11]'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
              Store private notes regarding sizing preferences, courier notes, or bespoke orders.
            </p>

            <textarea
              rows={3}
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              placeholder="e.g. VIP client, prefers Colombo 07 morning deliveries, linen size M..."
              className={`w-full rounded-2xl border p-3 text-xs transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setEditingNoteCustomer(null)}
                className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                  isDark
                    ? 'border-white/10 text-neutral-300 hover:bg-white/5'
                    : 'border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAF9]'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition-all shadow-luxury-xs cursor-pointer ${
                  isDark
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold'
                    : 'bg-[#0F0F11] hover:bg-neutral-800 text-white'
                }`}
              >
                {savedSuccess ? <Check className="h-4 w-4 stroke-[3]" /> : null}
                <span>{savedSuccess ? 'Saved!' : 'Save Note'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
