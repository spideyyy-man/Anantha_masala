# Pending Business, Legal & Product Data Verification Tracker
> **Rule:** Never fabricate missing business, legal, ingredient, nutritional, certification, or pricing facts. Every item below is explicitly handled with safe, transparent UX placeholders and documented as a pre-launch business verification item.

## 1. Launch-Blocking Legal & Identity Inputs
| ID | Item | Current Provisional State on Site | Required Owner Verification |
|---|---|---|---|
| BIZ-01 | Brand Spelling & Legal Entity Name | Provisional display: **Madurai Aanandha Masala** (matches packaging). Social profiles noted as **Madurai Anantha Masala** (`@madurai_anantha_masala`). | Confirm registered legal entity name (Proprietorship / Partnership / Pvt Ltd) and canonical spelling. |
| BIZ-02 | FSSAI License Verification | Displays `12423012000494` as *"Printed on packaging — verification pending"* | Verify active status, category scope (spices/flours/mixes), validity period, and licensee name on FSSAI FoSCoS. |
| BIZ-03 | Registered Business Address | Uses Villapuram Madurai address printed on packaging (`Meenakshi Nagar, Aruppukottai Main Road, Villapuram, Madurai - 625012`) | Confirm exact registered office & warehouse/dispatch address for Consumer Protection (E-Commerce) Rules & GST invoicing. |
| BIZ-04 | GSTIN & Tax Slabs | Displays MRP inclusive of applicable taxes; GSTIN marked pending | Confirm GST registration status / HSN codes per SKU (spices vs flours vs bath powder). |
| BIZ-05 | Grievance Officer & Support Email | Placeholder disclosure on `/legal/grievance-and-compliance` | Provide full name, designation, official email, phone, and SLA for Consumer Protection (E-Commerce) Rules & DPDP Act 2023. |
| BIZ-06 | Verified Business Phone / WhatsApp | `98438 87337` (printed on 33/35 packs & public Instagram bio) | Confirm consent to route website orders/enquiries to `+91 98438 87337`. Fix print typo `9943887337` on older `2.jpg` Idli Milagai Podi labels. |

## 2. Critical Packaging & Compliance Findings (From 35-Image Audit)
| ID | Affected Assets / SKUs | Finding | Action Taken on Website |
|---|---|---|---|
| CMP-01 | `6.jpg`, `17.jpg` (Sirudhaniya Dosai Maavu) | Physical label prints `சர்க்கரை நோய்க்கு சிறந்தது` ("Best for diabetes") | **Strictly omitted** from site copy, metadata, tags, and search keywords. Recommend packaging compliance review. |
| CMP-02 | `9.jpg`, `10.jpg` (Kuliyal Podi / Nalangu Maavu) | Non-edible herbal bath powder prints FSSAI food license & green veg mark | Segregated into **Traditional Herbal Care** category with explicit **"For External Use Only — Non-Edible"** notice. |
| CMP-03 | `14.jpg`, `20.jpg`, `33.jpg` | Labels print "100% Natural", "No Preservatives", "Rich in Nutrients" | **Omitted** from website claims until substantiated by lab/label compliance review. |
| CMP-04 | `18.jpg`, `30.jpg` (Sivappu Arisi Idiyappam Maavu) | Decorative bowl graphic inside printed label contains third-party `ULAMART.COM` watermark | Flagged for physical label artwork replacement before print reorder. |
| CMP-05 | `2.jpg`, `14.jpg`, `33.jpg`, `35.jpg` | Green veg symbol not visible on front label photo | Flagged for FSSAI Principal Display Panel check; site does not claim veg icon visible where absent. |
| CMP-06 | `1.jpg`, `3.jpg`, `16.jpg`, `22.jpg`, `25.jpg`, `35.jpg` | Mfd-to-Exp gap (3 months) conflicts with "Best Before 4/6 Months" text | Site displays printed Best-Before text with verification note; operator to standardize batch printer dates. |

## 3. Product Pricing, Weight & Ingredient Gaps
| ID | SKU / Asset | Gap | Safe Site Behavior |
|---|---|---|---|
| SKU-01 | Chilli Powder (`32.jpg`) | Net weight & MRP not visible on front photo | Displayed in catalogue with **"Price & Pack Size Pending Verification — Enquire on WhatsApp"** (Add-to-Cart disabled until confirmed). |
| SKU-02 | Idli Milagai Podi (`2.jpg` vs `35.jpg`) | Older label shows ₹75; newer label (`35.jpg`) shows ₹85 | Lists newer edition price **₹85 (100g)** with verification note. |
| SKU-03 | Kuliyal Podi (`9.jpg`, `10.jpg`) | Ribbon says ₹130 (200g); sticker crosses out ₹200 (250g) to handwritten ₹120 (200g) | Lists handwritten **₹120 (200g)** with verification note. |
| SKU-04 | Multigrain Chapathi Maavu (`13.jpg`) | Sticker crosses out 500g to handwritten 250g / ₹80 | Lists **₹80 (250g)** with verification note. |
| SKU-05 | Manjal Podi 50g (`29.jpg`) | Crossed-out 100g label with handwritten `30 Rs: 50gm` | Lists as 50g variant (**₹30**) alongside printed 100g (**₹60**) with verification note. |
| SKU-06 | Sourashtra Rasam Podi (`34.jpg`) | Handwritten "Sourashtra", `50gm`, and `50/-` | Lists **₹50 (50g)** with verification note. |
| SKU-07 | Kuzhambu Podi (`14.jpg`) vs Tamil Kuzhambu Podi (`24.jpg`) | Distinct labels & sizes (100g ₹75 vs 250g ₹150) | Listed as separate SKUs until confirmed if identical blend in two sizes. |
| SKU-08 | Sivappu Arisi Puttu & Idiyappam (`15.jpg`) vs Idiyappam (`30.jpg`) | Distinct labels, both 250g ₹120 | Listed as separate SKUs until confirmed if same flour grind. |
| SKU-09 | Back-label Ingredients, Allergens & Nutrition (23 of 25 SKUs) | Only `22.jpg` (Ulundhu Kali) and `33.jpg` (Kollu Kanji — missing Kollu on front line) list ingredients on front | Product pages show verified front ingredients where printed and transparently state *"Complete back-label ingredient, allergen & nutrition declaration pending packaging upload."* |
| SKU-10 | Pickles Category (Mango & Kalaka Pickle) | Referenced on Instagram Reels (`Df_vtAwAJip`, `Df74Es5A-CQ`) but no pack photos or prices in `Assets/` | Category page live with transparent *"Seasonal Pickles — Pack Photos & Online Pricing Pending; Enquire on WhatsApp"* flow. |

## 4. Operational & External Integrations Requiring Credentials
- **Shipping & Delivery Zones:** Provisional transparent slab implemented (Free above ₹499; ₹49 Tamil Nadu; ₹79 Rest of India) — clearly labeled provisional pending courier rate card & pincode serviceability integration.
- **Payment Gateway:** Razorpay adapter implemented behind `PaymentProviderAdapter`; runs in clearly badged **Sandbox Verification Mode** until `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` are supplied.
- **Production PostgreSQL:** Ready via `DATABASE_URL` environment variable; locally backed by embedded PostgreSQL (`PGlite`) for zero-friction development & testing.
- **Social Media APIs:** Instagram Graph API & YouTube Data API require authorized professional app credentials; site links directly to official profiles and displays clearly timestamped (23 Nov 2026) public content references without scraping or fabricating live metrics.
