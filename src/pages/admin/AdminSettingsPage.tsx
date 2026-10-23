import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Settings, RefreshCw, Database, Server, Check, AlertTriangle } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    StorageService.resetDemoData();
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-300">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Platform Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 mt-0.5">
            Platform Settings & Architecture
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            System parameters, demo persistence controls, and backend compatibility contracts.
          </p>
        </div>
      </div>

      {/* Backend Compatibility Matrix */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-neutral-900" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
            Target Architecture & PHP Backend Alignment
          </h2>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          This frontend prototype conforms to the production Kadeo backend architecture:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-2">
            <span className="font-bold text-neutral-900 block">Existing Core System</span>
            <ul className="space-y-1 text-neutral-600 list-disc list-inside">
              <li>PHP 8.1+ Custom OOP MVC Router</li>
              <li>MySQL Database (<code>whatsapp_shop</code>) via PDO</li>
              <li>PHPMailer notification service</li>
              <li>Rate limiting & security middlewares</li>
            </ul>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-2">
            <span className="font-bold text-neutral-900 block">Service Layer Abstraction</span>
            <ul className="space-y-1 text-neutral-600 list-disc list-inside">
              <li>Clean TypeScript Service Interface (<code>StorageService</code>)</li>
              <li>Ready to switch from <code>localStorage</code> to REST / JSON endpoints</li>
              <li>Relational OrderItem snapshots preserved</li>
              <li>WhatsApp URL encoding conforms to international E.164 standard</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Reset Section */}
      <div className="rounded-xl border border-red-200 bg-red-50/40 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-red-900">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Prototype Data Management
          </h2>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Reset all shops, products, orders, customers, and category changes back to pristine Sri Lankan initial seed data.
        </p>

        <div className="pt-2">
          {!resetConfirm ? (
            <button
              onClick={() => setResetConfirm(true)}
              className="inline-flex items-center gap-2 rounded-md bg-neutral-950 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Prototype to Factory State</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-red-700">Are you sure?</span>
              <button
                onClick={handleReset}
                className="rounded-md bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700"
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
