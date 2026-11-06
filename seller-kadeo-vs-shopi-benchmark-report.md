# KADEO vs shopi.lk: ශ්‍රී ලාංකික වෙළෙන්දෙකුගේ (Seller) මෙහෙයුම් දෘෂ්ටිකෝණයෙන් විග්‍රහය සහ වැඩිදියුණු කිරීමේ සැලැස්ම
**දිනය:** 2026 නොවැම්බර් 06  
**කර්තෘ:** Orion (Product & Systems Architect / OpenMausBot)  
**අනුමත කරන්නේ:** @Ada (Tech Lead / Chief of Staff)  
**මූලික යොමුව (Benchmark):** https://shopi.lk/ (ශ්‍රී ලංකාවේ ප්‍රමුඛතම E-Commerce Store Builder)

---

## 1. විධායක සාරාංශය (Executive Summary & Seller Perspective)

ශ්‍රී ලංකාවේ සුළු හා මධ්‍ය පරිමාණ ව්‍යාපාරිකයෙකු (කඩහිමියා / Instagram & Facebook Seller / Retailer) KADEO වේදිකාව භාවිතා කර භාණ්ඩ අලෙවි කිරීමට උත්සාහ කිරීමේදී, දැනට පවතින පද්ධතිය සතුව ශක්තිමත් WhatsApp ඇණවුම් ගලායාමක් සහ POS Sales Desk එකක් තිබුණද, දේශීය වෙළඳපොළේ සැබෑ තරඟකරුවෙකු වන **shopi.lk** සමඟ සැසඳීමේදී මෙහෙයුම් මට්ටමේ ප්‍රධාන අත්‍යවශ්‍ය අඩුපාඩු (Operational Gaps) 6ක් හඳුනාගත හැක.

ව්‍යාපාරිකයෙකුගේ දෛනික වේදනාව (Seller's Pain Points):
1. **ඇඳුම් හෝ ආහාර අලෙවිකරුවන්ට Sizes / Colors වැනි Variants නැතිවීම:** එක් ටී-ෂර්ට් එකකට Size 4ක් (S, M, L, XL) සහ පාට 3ක් තිබේ නම්, වෙන් වෙන් වශයෙන් භාණ්ඩ 12ක් ඇතුළත් කිරීමට සිදුවේ. මෙය වෙළෙන්දාගේ Catalog එක අවුල් කරන අතර පාරිභෝගිකයාටද අපහසුය.
2. **බෙදාහැරීම් ගාස්තු තමන්ට රිසිසේ වෙනස් කිරීමට නොහැකි වීම:** `CartDrawer.tsx` හි Colombo LKR 350 සහ Outstation LKR 450 ලෙස hardcode කර ඇත. වෙළෙන්දාට තමන්ගේ Courier ගාස්තු හෝ නොමිලේ බෙදාහැරීමේ සීමා (Free Shipping Threshold) Dashboard Settings හරහා සැකසීමට නොහැක.
3. **බැංකු තැන්පතු රිසිට්පත් (Bank Slip Upload) ලබාගැනීමට නොහැකි වීම:** ශ්‍රී ලංකාවේ අන්තර්ජාල ඇණවුම්වලින් 40% කට වැඩි ප්‍රමාණයක් සිදුවන්නේ Online Banking / CDM මගිනි. පාරිභෝගිකයාට Slip එක Upload කිරීමට ක්‍රමයක් නැති අතර, වෙළෙන්දාට තම බැංකු ගිණුම් විස්තර Storefront හි පෙන්වීමට ක්‍රමයක් නැත.
4. **POS මුදල් කවුන්ටරයේදී 'Paid' ලෙස ලකුණු නොවීම:** POS මගින් ඇණවුම සෑදූ විට එය 'Payment Not Recorded' ලෙස සටහන් වන අතර, පාරිභෝගිකයා අතට මුදල් දුන් පසු වෙනම Orders වෙත ගොස් Manual Payment දැමීමට සිදුවේ. කවුන්ටරයේ පෝලිම් පවතින අවස්ථාවල මෙය ප්‍රායෝගික නොවේ.
5. **සිංහල සහ දෙමළ (Sinhala / Tamil) භාෂා සහයෝගය නොමැති වීම:** Storefront සහ Dashboard 100% ඉංග්‍රීසි භාෂාවෙන් පමණක් පැවතීම නිසා දේශීය ගැණුම්කරුවන්ගේ Conversion අනුපාතය අඩු වේ. shopi.lk හි Enterprise පැකේජය තුළ භාෂා 3ම ඇත.
6. **AI සෙවුම් සුදානම (AI Discovery) නොමැති වීම:** shopi.lk හි ප්‍රධාන වෙළඳපල ආකර්ෂණය වන්නේ ChatGPT, Gemini සහ Copilot වෙත ස්වයංක්‍රීයව භාණ්ඩ දත්ත නිකුත් කරන `products.json`, `llms.txt`, සහ `agent.json` ගොනු ස්වයංක්‍රීයව ජනනය වීමයි. Kadeo හි මෙය තවමත් ක්‍රියාත්මක කර නොමැත.

---

## 2. සත්‍යාපිත කේත සාක්ෂි (Verified Codebase Evidence in KADEO)

KADEO පද්ධතියේ සත්‍ය කේතය පරීක්ෂා කිරීමේදී තහවුරු වූ කරුණු:

| අංශය | KADEO පවතින කේතය | සත්‍ය තත්ත්වය සහ සීමාව |
|---|---|---|
| **Product Model** | `src/types/database.ts` (L59-71), `src/lib/validations/catalog.ts` (L18-32) | `price`, `stock_quantity`, `sku` පමණක් ඇත. Variants (Size/Color) හෝ `low_stock_threshold` සඳහා schema එකක් නොමැත. |
| **Delivery Rates** | `src/components/storefront/CartDrawer.tsx` (L176-177) | `const deliveryFee = currentZone === "outstation" ? 450 : currentZone === "pickup" ? 0 : 350;` ලෙස Hardcode කර ඇත. Settings මගින් වෙනස් කළ නොහැක. |
| **Settings Fields** | `src/features/shops/settings-actions.ts` (L8-37) | `name`, `whatsappNumber`, `contactEmail`, `address`, `description`, `deliveryInfo`, `storeVisibility` පමණි. Bank Details හෝ Courier Delivery Rates නොමැත. |
| **Payment Ledger** | `src/features/payments/actions.ts` (L9-14) | Seller හට backend එකෙන් Manual payment ("cash", "bank_transfer") දැමිය හැකි නමුත්, Customer Checkout හි Bank Slip Upload හෝ Slip Verification UI නොමැත. |
| **POS Sales Desk** | `src/components/dashboard/SalesDesk.tsx`, `src/components/shared/OrderThermalReceipt.tsx` | Desk Orders නිර්මාණය වේ, Receipt print වේ. එහෙත් Cash Tendered / Change Due ගණනයක් නැත; ඇණවුම "Pending / Payment not recorded" ලෙස ලකුණු වේ. |
| **Courier Tracking** | `src/components/dashboard/OrderStatusForm.tsx` (L113-138) | `courierName` සහ `trackingNumber` ඇතුළත් කළ හැක. එහෙත් Domex / Koombiyo / Pronto ක්ෂණික Tracking Links හෝ Thermal Shipping Label Print නොමැත. |
| **AI Discovery** | `src/app` | `products.json`, `llms.txt`, `agent.json` routes කිසිවක් නොමැත. |
| **Multi-Language** | `src/components/storefront/` | කිසිදු i18n හෝ Localization library එකක් නැත. Storefront UI 100% hardcoded English වේ. |
| **Subscriptions** | `src/app/dashboard/subscription/page.tsx` | "Starter Free" සහ "Pro Business (Upgrade unavailable)" පෙන්වයි. LKR පැකේජ මිල ගණන් හෝ සැබෑ Subscription Gateway එකක් නොමැත. |

---

## 3. KADEO එදිරිව shopi.lk සවිස්තරාත්මක සංසන්දනය (Benchmark Matrix)

| විශේෂාංගය (Feature) | shopi.lk හැකියාව | KADEO වත්මන් තත්ත්වය | ශ්‍රී ලාංකික වෙළෙන්දාට ඇති බලපෑම |
|---|---|---|---|
| **Product Variants (Sizes / Colors)** | Business පැකේජයේ සිට සම්පූර්ණ Variants සහය (S/M/L/XL, Colors). | Variants නැත. Single SKU සහ Stock පමණි. | **අධික බාධාවකි.** ඇඳුම්, පාවහන්, ආභරණ විකිණීමට නොහැකි තරම් අපහසුයි. |
| **Low-Stock Alert** | Real-time Pop-up සහ Email alerts. | Alerts නැත. Stock = 0 වූ විට out_of_stock වේ. | බඩු ඉවර වූ පසු පමණක් වෙළෙන්දා දැනගනී; Orders අවලංගු කිරීමට සිදුවේ. |
| **Bank Transfer / Slip Upload** | Direct bank deposit සහ Receipt upload සහය. | Customer Checkout හි Bank විකල්ප හෝ Slip Upload නැත. | ලංකාවේ ගැනුම්කරුවන්ගෙන් 40% ක් කාඩ්පත් නැති බැවින් WhatsApp හරහා Slips ඉල්ලීමට සිදුවේ. |
| **Delivery Zones & Rates** | Colombo, Suburbs, Outstation සඳහා වෙන් වෙන් ගාස්තු සැකසිය හැක. | Hardcoded (Colombo 350, Outstation 450). | වෙළෙන්දාට තම සැබෑ කුරියර් ගාස්තුව හෝ Free Shipping ලබාදිය නොහැක. |
| **Courier Integration (Waybills)** | Domex, Koombiyo, Prompt වැනි දේශීය කුරියර් ඒකාබද්ධතාව. | Manual Text Box (Courier Name, Waybill No). | Tracking Link ස්වයංක්‍රීයව නොහැදේ; Shipping Waybill Label print කළ නොහැක. |
| **POS Sales Desk** | Local sales සඳහා Basic POS සහය. | Sales Desk පවතී, Thermal Receipt ඇත. | කවුන්ටරයේදී මුදල් ගෙවූ බව (Paid) සටහන් නොවේ; Change calculator නැත. |
| **Vertical Themes** | Food, Bakery, Gifts, Rentals, Luxury සඳහා විශේෂිත themes 5+. | Boutique, Classic, Minimal, ModernRetail (සාමාන්‍ය retail themes). | කෑම බීම සහ බේකරි සඳහා Delivery Time Slot හෝ Add-on Toppings නැත. |
| **AI Discovery Readiness** | `products.json`, `llms.txt`, `agent.json` ස්වයංක්‍රීයව ජනනය වේ. | සහයෝගය නොමැත. | ChatGPT, Gemini හරහා භාණ්ඩ සොයන පාරිභෝගිකයින්ට Kadeo කඩ නොපෙනේ. |
| **භාෂා සහයෝගය (Languages)** | සිංහල, தமிழ், English භාෂා 3ම සහය දක්වයි. | ඉංග්‍රීසි පමණි. | ඉංග්‍රීසි නොදන්නා දේශීය ගැණුම්කරුවන් මිලදී ගැනීම අත්හරියි. |
| **පැකේජ සහ මිල ගණන් (Pricing)** | Starter (Free), Mini (LKR 3,990), Business (5,500), Enterprise (7,500). | Free Starter සහ Unbuilt Pro පමණි. | වෙළෙන්දාට තම ව්‍යාපාර වර්ධනයට සරිලන පැහැදිලි LKR පැකේජයක් නැත. |

---

## 4. මෙහෙයුම් දෘෂ්ටිකෝණයෙන් ප්‍රමුඛතා වැඩිදියුණු කිරීම් (Actionable Implementation Proposals)

### Phase 1: වහාම ක්‍රියාත්මක කළ යුතු අත්‍යවශ්‍ය මෙහෙයුම් අංග (High Priority / Immediate Value)

#### 1.1 Product Variations Support (Sizes, Colors, Weights)
- **අයිතිකරු (Owner):** Lin (Backend / Schema) & Pixel (Frontend UI)
- **යෝජිත විසඳුම:**
  - Database schema එකට `product_variants` table එකක් එක් කිරීම: `id, product_id, shop_id, name (e.g. "Size: L / Color: Blue"), sku, price, stock_quantity, status`.
  - `ProductEditor.tsx` හි Option Types (Size, Color, Weight) සහ Variant Matrix එකක් එක් කිරීම.
  - `CartDrawer.tsx` සහ Storefront තේමාවල Variant Selector (Drop-down / Pills) ලබාදීම.
- **පිළිගැනීමේ නිර්ණායක (Acceptance Criteria):**
  1. වෙළෙන්දෙකුට එකම භාණ්ඩයකට Variants 20ක් දක්වා එක් කිරීමට හැකි විය යුතුය.
  2. එක් එක් Variant එකට වෙන් වෙන් වශයෙන් stock සහ මිල පාලනය කළ හැකි විය යුතුය.
  3. පාරිභෝගිකයා තෝරාගන්නා Variant එක Order Item snapshot එකෙහි නිවැරදිව සටහන් විය යුතුය.
- **වෙළඳපල වාසිය:** විලාසිතා (Fashion), පාවහන් සහ ආහාර නිෂ්පාදන අලෙවිකරුවන් Kadeo වෙත ආකර්ෂණය කරගත හැක.

#### 1.2 Seller-Configurable Delivery Zones & Free Shipping Threshold
- **අයිතිකරු (Owner):** Lin (Settings Actions) & Pixel (Store Settings & Cart)
- **යෝජිත විසඳුම:**
  - `shop_settings` වගුවට `delivery_colombo_fee`, `delivery_outstation_fee`, `delivery_pickup_enabled`, `free_delivery_threshold` ක්ෂේත්‍ර එක් කිරීම.
  - `src/app/dashboard/settings/page.tsx` හි Delivery Settings කාඩ්පතක් එක් කිරීම.
  - `CartDrawer.tsx` හි hardcode කළ අගයන් ඉවත් කර, Shop Settings මගින් ගාස්තු ගණනය කිරීම. Subtotal >= Free Delivery Threshold නම් බෙදාහැරීම LKR 0 විය යුතුය.
- **පිළිගැනීමේ නිර්ණායක (Acceptance Criteria):**
  1. වෙළෙන්දා Settings හි Colombo ගාස්තුව 400 සහ Outstation 550 ලෙස සැකසූ විට Checkout හි එය නිවැරදිව පෙන්විය යුතුය.
  2. Free Shipping Threshold එක LKR 5,000 ලෙස දැමූ විට, කරත්තයේ එකතුව 5,000 ඉක්මවූ සැණින් Delivery Fee එක 0 ලෙස ස්වයංක්‍රීයව යාවත්කාලීන විය යුතුය.

#### 1.3 Bank Deposit / Slip Upload Checkout Flow
- **අයිතිකරු (Owner):** Lin (Order API / Storage) & Pixel (Customer Checkout & Order Admin)
- **යෝජිත විසඳුම:**
  - `shop_settings` තුළ වෙළෙන්දාගේ බැංකු විස්තර (Bank Name, Branch, Account Name, Account Number) සුරැකීමට ඉඩදීම.
  - Checkout හි "Cash on Delivery (COD)" සහ "Direct Bank Transfer" තෝරාගැනීමට අවස්ථාව දීම.
  - Bank Transfer තෝරාගත් විට බැංකු විස්තර පෙන්වීම සහ Order Success පිටුවේදී හෝ Checkout හිදී Bank Slip (Image / PDF) Upload කිරීමට ඉඩදීම (`/api/store-images` හෝ Supabase storage හරහා).
  - Seller Order Detail පිටුවේ (`/dashboard/orders/[id]`) Upload කරන ලද Bank Slip එක Preview බැලීමට හා "Verify Slip & Mark Paid" බොත්තම ලබාදීම.
- **පිළිගැනීමේ නිර්ණායක (Acceptance Criteria):**
  1. පාරිභෝගිකයාට Slip එකක් උඩුගත කළ හැකි විය යුතු අතර, එය `orders.bank_slip_url` හි සුරැකිය යුතුය.
  2. වෙළෙන්දාට Order Detail තුළ Slip එක පරීක්ෂා කර තනි ක්ලික් කිරීමකින් `recordManualPaymentAction` කැඳවිය හැකි විය යුතුය.

---

### Phase 2: දෛනික කවුන්ටර සහ බෙදාහැරීමේ කාර්යක්ෂමතාව (Operational Velocity)

#### 2.1 POS Sales Desk Instant Cash Settlement & Change Due Calculator
- **අයිතිකරු (Owner):** Pixel (POS UI) & Lin (Desk Order Actions)
- **යෝජිත විසඳුම:**
  - `SalesDesk.tsx` තුළ "Tendered Cash" ආදාන ක්ෂේත්‍රයක් එක් කිරීම.
  - පාරිභෝගිකයා දෙන මුදල ඇතුළත් කළ විට, "Change Due" (ඉතිරි මුදල) ස්වයංක්‍රීයව ගණනය කර පෙන්වීම.
  - "Complete & Mark Paid" තේරූ විට, ඇණවුම සෑදීමත් සමඟම `recordManualPaymentAction` කැඳවා එකවර Paid ලකුණු කිරීම.
  - `OrderThermalReceipt.tsx` හි "PAID - CASH SALE" ලෙස සහ Change මුදල සඳහන් කිරීම; 58mm සහ 80mm roll size toggle එකක් ලබාදීම.
- **පිළිගැනීමේ නිර්ණායක (Acceptance Criteria):**
  1. මුදල් කවුන්ටරයකදී විනාඩියකට අඩු කාලයකින් භාණ්ඩ තෝරා, මුදල් ලබාගෙන, බිල්පත මුද්‍රණය කළ හැකි විය යුතුය.
  2. මුද්‍රිත බිල්පතෙහි Order Token එක සමඟ "PAID IN FULL" තත්ත්වය සටහන් විය යුතුය.

#### 2.2 Local Courier Direct Tracking Links & 4x6 Thermal Shipping Labels
- **අයිතිකරු (Owner):** Pixel & Rigel
- **යෝජිත විසඳුම:**
  - `courier_name` අනුව Domex, Koombiyo, Pronto, Fardar, Prompt සහ SL Post සඳහා සෘජු Tracking URL එකක් සෑදීම:
    - Domex: `https://domex.lk/tracking?waybill=${trackingNumber}`
    - Koombiyo: `https://koombiyodelivery.lk/track?waybill=${trackingNumber}`
    - Pronto: `https://prontolanka.lk/tracking.php?hawb=${trackingNumber}`
  - පාරිභෝගිකයාගේ `order-success` සහ `track` පිටුවේ Tracking බොත්තම ක්ලික් කළ විට එකවර අදාළ Courier අඩවියට යොමු කිරීම.
  - Order Detail පිටුවෙන් 4x6 අඟල් Thermal Waybill Label එකක් (QR Code, Receiver Address, Phone, COD Amount සහිතව) Print කිරීමට පහසුකම් සැලසීම.

#### 2.3 Low-Stock Dashboard Badges & Alerts
- **අයිතිකරු (Owner):** Pixel & Lin
- **යෝජිත විසඳුම:**
  - Product model එකට `low_stock_threshold` (default 5) එක් කිරීම.
  - Stock quantity <= threshold වන විට `ProductListClient.tsx` හි කහ පැහැති "Low Stock" badge එකක් සහ වෙනම Filter එකක් ලබාදීම.
  - Dashboard Home එකෙහි "Attention Needed: 3 items running low on stock" ලෙස Summary Card එකක් පෙන්වීම.

---

### Phase 3: වෙළඳපල තරඟකාරිත්වය සහ අනාගත තාක්ෂණය (Market Differentiation)

#### 3.1 AI Discovery Readiness (products.json, llms.txt, agent.json)
- **අයිතිකරු (Owner):** Lin (API Routes) & Rigel (Verification)
- **යෝජිත විසඳුම (shopi.lk ට වඩා ඉදිරියෙන් සිටීමට):**
  - Next.js Route Handlers සකස් කිරීම:
    1. `/shop/[slug]/products.json`: සක්‍රීය භාණ්ඩවල නම, විස්තරය, මිල, තොග තත්ත්වය, සහ සෘජු links සහිත Schema.org ආකෘතිය.
    2. `/shop/[slug]/llms.txt`: AI භාෂා මාදිලිවලට (ChatGPT, Gemini, Claude) කියවිය හැකි සරල පෙළ (Plain Markdown).
    3. `/shop/[slug]/agent.json`: AI Agents සඳහා වූ API endpoints සහ Store Policy තොරතුරු.
- **පිළිගැනීමේ නිර්ණායක (Acceptance Criteria):**
  1. ඕනෑම වෙළඳසැලක `/shop/ceylon-linen/llms.txt` වෙත පිවිසි විට, තත්පර 1ක් ඇතුළත වෙළඳසැලේ සක්‍රීය භාණ්ඩ ලැයිස්තුව පෙළ ආකෘතියෙන් ලැබිය යුතුය.
  2. Cache-Control Header එකක් සහිතව තත්පර 60කට වරක් ස්වයංක්‍රීයව refresh විය යුතුය.

#### 3.2 Sinhala & Tamil Storefront Localization (i18n)
- **අයිතිකරු (Owner):** Pixel
- **යෝජිත විසඳුම:**
  - Storefront Header එකෙහි භාෂා තේරීම (English | සිංහල | தமிழ்) ලබාදීම.
  - Cart, Checkout, Buttons ("මිලදී ගන්න", "කරත්තයට එක් කරන්න", "තහවුරු කරන්න") දේශීය භාෂාවෙන් දිස්වීම.
  - වෙළෙන්දාට භාණ්ඩයේ නම සහ විස්තරය සිංහලෙන් හෝ දෙමළෙන් ලිවීමට සම්පූර්ණ Unicode සහය තිබීම තහවුරු කිරීම.

#### 3.3 Transparent LKR Subscription Plans (මිල ගණන් ආකෘතිය)
- **අයිතිකරු (Owner):** Ada & Lin
- **යෝජිත විසඳුම:**
  - shopi.lk හි ඇති පරිදි පැහැදිලි දේශීය රුපියල් මිල ගණන් සහිත පැකේජ 3ක් හඳුන්වා දීම:
    1. **Starter (රු. 0 / Free Forever):** භාණ්ඩ 15 දක්වා, WhatsApp Checkout, සාමාන්‍ය Themes, 0% Commission.
    2. **Standard Shop (රු. 3,500 / මසකට):** භාණ්ඩ 60 දක්වා, Variants (Sizes/Colors), Bank Slip Upload, Dynamic Delivery Fees, Basic POS.
    3. **Pro Business (රු. 5,900 / මසකට):** අසීමිත භාණ්ඩ, AI Discovery (llms.txt), Multilingual Storefront, Full POS Thermal Receipt, Priority Support.
  - දේශීය වෙළෙන්දන්ට පහසු වන පරිදි Kadeo ගිණුමට Bank Deposit මගින් Subscription ගෙවීමේ ක්‍රමවේදයක් (Manual activation with slip) මුල් අදියරේදී ලබාදීම.

---

## 5. ක්‍රියාත්මක කිරීමේ වගකීම් බෙදීම (Assigned Team Ownership)

| කණ්ඩායම් සාමාජිකයා | ප්‍රධාන වගකීම් ක්ෂේත්‍රය | මීළඟ පියවර (Immediate Next Task) |
|---|---|---|
| **@Ada (Tech Lead)** | Architecture sign-off, Pricing model approval, Database migration planning | Migration සැලසුම අනුමත කිරීම සහ කණ්ඩායමේ sprint ඉලක්ක වෙන් කිරීම. |
| **Lin (Backend)** | Schema modifications (variants, delivery rates, bank slip url), AI discovery endpoints (`llms.txt`, `products.json`) | `product_variants` සහ `shop_settings` delivery/bank schema නිර්මාණය. |
| **Pixel (Frontend)** | Variant selector UI, Bank Slip upload UI, Delivery settings form, POS instant cash checkout | `CartDrawer.tsx` සහ `SettingsForm.tsx` හි delivery/bank ක්ෂේත්‍ර යාවත්කාලීන කිරීම. |
| **Rigel (QA & Release)** | Isolated fixture testing, Courier tracking URL verification, Mobile viewport validation | සැබෑ දත්තවලට හානි නොවන පරිදි Mock fixtures හරහා automated test suites ධාවනය. |

---

## 6. නිගමනය (Conclusion)

KADEO සතුව දැනටමත් ඉතා වේගවත්, පිරිසිදු තාක්ෂණික පදනමක් (Next.js App Router + Supabase + Tailwind) ඇත. shopi.lk හා සැසඳීමේදී Kadeo හි ඇති ප්‍රධානතම වාසිය වන්නේ එහි සරල බව සහ 0% Commission ආකෘතියයි. 

ඉහත යෝජිත **Product Variants**, **Dynamic Delivery Fees**, **Bank Slip Upload**, සහ **AI Discovery (llms.txt)** යන අංග 4 කඩිනමින් එක් කිරීමෙන්, KADEO ශ්‍රී ලාංකික වෙළඳපොළේ අංක 1 දේශීය E-Commerce Store Builder බවට පත්කිරීමේ හැකියාව නිරපේක්ෂ වශයෙන්ම පවතී.
