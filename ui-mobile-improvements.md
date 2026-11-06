# UI & Mobile Experience Improvements Report (Pixel)

Sprint Date: 2026-11-06  
Sprint Deadline: 07:20 Sri Lanka time (01:50 UTC)  
Sprint Workspace: `C:\Users\USER\.openmausbot\task-workspaces\037c1527-cae9-4d11-8acc-6f16ac86030a\70633e3b-54d9-42a8-9aac-cf24255d67e1`  
Live Application: `C:\Users\USER\Documents\KADEO` (localhost:3000)

---

## 1. Executive Summary

As Frontend Engineer (Pixel), this phase implemented and hardened **retry-stable checkout idempotency keys**, **synchronous double-submit guards**, and **failure input preservation** across storefront and POS checkout surfaces:
- [`CartDrawer.tsx`](file:///C:/Users/USER/Documents/KADEO/src/components/storefront/CartDrawer.tsx) (Storefront buyer checkout)
- [`SalesDesk.tsx`](file:///C:/Users/USER/Documents/KADEO/src/components/dashboard/SalesDesk.tsx) (Seller POS direct order entry)
- [`checkout-idempotency.ts`](file:///C:/Users/USER/Documents/KADEO/src/lib/checkout-idempotency.ts) (Deterministic payload digest & key generator)

The implementation directly aligns with Architecture Improvement Plan **A4** and the backend contract in `src/features/orders/actions.ts` (`submitOrderAction`) and `local-adapter.ts`/PostgreSQL migration `20261106010000_manual_payment_ledger.sql`.

---

## 2. Implementation Architecture

### A. Idempotency Key & Digest Generator ([`src/lib/checkout-idempotency.ts`](file:///C:/Users/USER/Documents/KADEO/src/lib/checkout-idempotency.ts))
1. **Deterministic Order Intent Digest (`computeCheckoutPayloadDigest`)**:
   - Computes a canonical hash string from `shopSlug`, `customerName`, `customerPhone`, `customerAddress`, `customerEmail`, `orderNote`, and sorted items (`productId:quantity`).
   - Normalizes whitespace and sorts item arrays by `productId` so variations in line order produce an identical digest.
2. **Bounded Key Generator (`generateCheckoutIdempotencyKey`)**:
   - Generates collision-resistant keys formatted as `kadeo_<prefix>_<uuid>` (e.g., `kadeo_cart_790c96d0-...` and `kadeo_pos_4a04c037-...`).
   - Total string length is ~47 characters, safely within the PostgreSQL / Zod constraint of 100 characters.

### B. Storefront Checkout ([`src/components/storefront/CartDrawer.tsx`](file:///C:/Users/USER/Documents/KADEO/src/components/storefront/CartDrawer.tsx))
1. **Retry Key Stability**:
   - Tracks `checkoutAttemptRef = useRef<{ key: string; digest: string } | null>(null)`.
   - When a submission fails transiently (network socket drop, server error), the error message is displayed and customer inputs (`details`) remain intact.
   - When the user clicks "Place order" again without modifying inputs, `currentDigest === checkoutAttemptRef.current.digest`, so the **exact same `idempotencyKey`** is submitted. This allows the backend to return the already-created order without double-charging inventory if the previous attempt succeeded on the database.
2. **Payload Change Rotation**:
   - If the user modifies any field (name, phone, address, email, note, or cart quantities), `currentDigest` changes, automatically generating a fresh `idempotencyKey`.
3. **Double-Submit Guard**:
   - Synchronous `submitting.current` guard and button `disabled={loading}` prevent duplicate in-flight requests on rapid double clicks.
4. **Success Cleanup**:
   - Clears `checkoutAttemptRef.current = null`, clears the cart, and redirects to `/order-success`.

### C. POS Sales Desk ([`src/components/dashboard/SalesDesk.tsx`](file:///C:/Users/USER/Documents/KADEO/src/components/dashboard/SalesDesk.tsx))
1. **Retry Key Stability**:
   - Uses `checkoutAttemptRef = useRef<{ key: string; digest: string } | null>(null)`.
   - On transient failure from `createDeskOrderAction`, inputs (`lines` and `customer`) are preserved and the error banner is displayed.
   - Retrying without changing inputs sends the **exact same `idempotencyKey`**.
2. **Payload Change Rotation**:
   - Modifying line quantities via catalog buttons or editing customer fields changes `currentDigest`, triggering key rotation.
3. **Double-Submit Guard**:
   - Synchronous `locked.current` ref and `fieldset disabled={pending}` block double-click execution.
4. **Clean New Sale**:
   - On successful receipt or clicking "Clear draft", `checkoutAttemptRef.current = null`, `lines` and `customer` are reset, and `sessionStorage` draft is removed.

---

## 3. Test Verification Results

### A. Dedicated Idempotency & Component Invocation Suite ([`tests/unit/checkout-idempotency.test.cjs`](file:///C:/Users/USER/Documents/KADEO/tests/unit/checkout-idempotency.test.cjs))
Executed via `node --test tests/unit/checkout-idempotency.test.cjs`:
- **Checkout Idempotency Utilities**:
  - `computeCheckoutPayloadDigest normalizes whitespace and ignores item order`: PASS
  - `computeCheckoutPayloadDigest changes when order details or items change`: PASS
  - `generateCheckoutIdempotencyKey generates scoped, collision-resistant keys within 100 char limit`: PASS
- **SalesDesk Component Checkout Invocation & Retry Stability**:
  - `transient failure preserves form inputs and retrying submission retains exact same idempotencyKey`: PASS
  - `modifying basket lines or customer inputs rotates to a new idempotencyKey`: PASS
  - `double-submit guard prevents multiple concurrent desk order action calls`: PASS
- **CartDrawer Component Checkout Invocation & Retry Stability**:
  - `transient checkout failure preserves inputs and retrying uses exact same idempotencyKey`: PASS
  - `modifying customer input fields rotates to a new idempotencyKey`: PASS
  - `double-submit guard prevents multiple concurrent cart order submissions`: PASS
- **Result**: **9/9 tests passed (0 failed, duration: ~780ms)**.

### B. Draft Persistence & Cross-Shop Isolation Suite ([`tests/unit/sales-desk-draft-ui.test.cjs`](file:///C:/Users/USER/Documents/KADEO/tests/unit/sales-desk-draft-ui.test.cjs))
- Transpiled `SalesDesk.tsx` component effect verification, zero cross-shop storage write violations, phone normalization, and in-memory mutation tests:
- **Result**: **15/15 tests passed (0 failed, duration: ~663ms)**.

### C. Full Repository System Suite (`node verify-experience.cjs`)
- Executed full test runner across all unit suites in disposable isolated environment:
- **Result**: **126 tests passed across 38 suites (0 failed, 0 skipped, duration: ~7170ms)**.

### D. TypeScript Static Analysis (`tsc -p tsconfig.json --noEmit`)
- **Result**: **0 errors**.

---

## 4. Synchronized Owned Files & SHA-256 Hashes

All 12 owned frontend files were verified and matched between the sprint workspace and [`C:/Users/USER/Documents/KADEO`](file:///C:/Users/USER/Documents/KADEO):

| File Path | SHA-256 Hash | Status |
|---|---|---|
| [`src/lib/checkout-idempotency.ts`](file:///C:/Users/USER/Documents/KADEO/src/lib/checkout-idempotency.ts) | `F6C545B9ECBF31553674BB824A409930A4FDD8E0AB25C5B2EAE3368EAE3733A9` | Synchronized |
| [`src/lib/sales-desk-storage.ts`](file:///C:/Users/USER/Documents/KADEO/src/lib/sales-desk-storage.ts) | `F40917CC8637189A6EBD7923A6371DEC4B4A6D5488CFBB350F982818E7CA5108` | Synchronized |
| [`src/lib/phone.ts`](file:///C:/Users/USER/Documents/KADEO/src/lib/phone.ts) | `2332DA23A1EC94F0CF99F03F653AE222690772C798C10D3E188DCA084F34D59B` | Synchronized |
| [`src/components/dashboard/SalesDesk.tsx`](file:///C:/Users/USER/Documents/KADEO/src/components/dashboard/SalesDesk.tsx) | `E68ABDB825A710B406B337964A04C0F0A02918340E3C03F03CD62A97FF8A72D4` | Synchronized |
| [`src/components/dashboard/CustomerListClient.tsx`](file:///C:/Users/USER/Documents/KADEO/src/components/dashboard/CustomerListClient.tsx) | `4E419BAC6E13F3D702613A7D91B110B2D698D427D0796F6CAD196D9F1D625AFA` | Synchronized |
| [`src/components/dashboard/DashboardShell.module.css`](file:///C:/Users/USER/Documents/KADEO/src/components/dashboard/DashboardShell.module.css) | `DE4CF590951F662F728B5A2CE0857CAFC648876A63C4B889791FE717B9CA5B47` | Synchronized |
| [`src/components/dashboard/OrderStatusForm.tsx`](file:///C:/Users/USER/Documents/KADEO/src/components/dashboard/OrderStatusForm.tsx) | `202C88EF336E53C92AAAAD2AF2DE56AD7B80D8DFB5B69F421B6FE077C2CC4531` | Synchronized |
| [`src/components/dashboard/SettingsForm.tsx`](file:///C:/Users/USER/Documents/KADEO/src/components/dashboard/SettingsForm.tsx) | `59C467973FBA3415C55D69DB0649067F28E71C284CD2AC084B0DE9A0CBE298E3` | Synchronized |
| [`src/components/storefront/CartDrawer.tsx`](file:///C:/Users/USER/Documents/KADEO/src/components/storefront/CartDrawer.tsx) | `6466BC6FE6E03C7AA267FD93E397D30AE88BCD3247973FA7175F7287B6DC5DCF` | Synchronized |
| [`tests/unit/checkout-idempotency.test.cjs`](file:///C:/Users/USER/Documents/KADEO/tests/unit/checkout-idempotency.test.cjs) | `43B3EF691FD36A5833B70B5D20077B3BC9339142AA1AAB2794960D641B6945A9` | Synchronized |
| [`tests/unit/sales-desk-draft-ui.test.cjs`](file:///C:/Users/USER/Documents/KADEO/tests/unit/sales-desk-draft-ui.test.cjs) | `E43859F0D739AD569B94DDD7807A220EB71AF334433C0F3F1F6AF9A4C80ED0F1` | Synchronized |
| [`tests/unit/customer-sales-desk.test.cjs`](file:///C:/Users/USER/Documents/KADEO/tests/unit/customer-sales-desk.test.cjs) | `940E52ED6E68F770B653436FF6B94C671F56F555A940C8406A25592F7BF6DE56` | Synchronized |

*No database files (`kadeo-local-db.json`), environment variables (`.env.local`), payments, or messages were modified.*

---

## 5. Verification Scope & Handoff to Rigel

| Surface / Flow | Acceptance Item | Verification Scope | Status |
|---|---|---|---|
| **Storefront Cart Idempotency** | Retry uses identical key; payload change rotates key; double-submit blocked | Automated hook harness (`checkout-idempotency.test.cjs`) | **Verified by Unit Test** |
| **Sales Desk Idempotency** | Retry uses identical key; lines/customer change rotates key; double-submit blocked | Automated hook harness (`checkout-idempotency.test.cjs`) | **Verified by Unit Test** |
| **Draft Persistence & Isolation** | Shop A draft never written to Shop B key; storage error cleanly resets inputs | Automated lifecycle harness (`sales-desk-draft-ui.test.cjs`) | **Verified by Unit Test** |
| **Storefront Cart UX (Visual)** | Touch targets on `+`/`-`/trash at least 36px; dialog focus trapped; Escape closes drawer | Real mounted browser | **Pending Rigel Browser Verification** |
| **Sales Desk Mobile (360px/390px)** | Sticky bottom bar renders with total and items count; tap targets min 40px | Real mounted browser | **Pending Rigel Browser Visual Check** |
| **Customer List Mobile (360px)** | Cards view renders cleanly; direct WhatsApp and Call buttons trigger external actions | Real mounted browser | **Pending Rigel Browser Visual Check** |
| **Dashboard Styles & Outlines** | Form controls preserve high-contrast `#7960df` focus rings and `#7959d4` buttons | Real mounted browser | **Pending Rigel Browser Visual Check** |

Pixel has strictly adhered to ownership boundaries by avoiding browser automation on the mounted browser surface. All frontend logic, idempotency contracts, and test suites are 100% verified, type-checked, and synchronized.
