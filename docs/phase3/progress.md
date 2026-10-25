# المرحلة 3 — سجل التنفيذ (Progress Log)

- **المرجع:** P3-A (2026-10-15) — «تمت المراجعة بالكامل وأتابع العمل بنفس النظام الصارم».
- **قاعدة السجل:** كل ناتج هنا مأخوذ من أوامر مُشغَّلة فعليًا — لا تقديرات.

---

## 2026-10-15 — جولة 1: التأسيس وأول بناء ناجح

### 1. الأداة (Toolchain)
| البند | النتيجة الفعلية |
|---|---|
| `node --version` (مسار كامل) | `v24.19.0` |
| `npm --version` (مسار كامل) | `11.17.0` (المخاطرة المسجَّلة: تعليق أول استدعاء — لم يتكرر) |
| `scripts/use-node.ps1` | أُنشئ (خيار 1 T3 — تأثير جلسة فقط) |

### 2. التثبيت (npm registry — 2026-10-15)
- حزم الإنتاج: **182 حزمة / 7 دقائق** · حزم التطوير: **350 حزمة / 8 دقائق** · ثم تخفيض typescript 18 ثانية.
- **الإصدارات الفعلية (npm ls --depth=0):** next@16.4.0 · react@19.3.0 · react-dom@19.3.0 · next-intl@4.14.9 · next-mdx-remote@6.0.0 · gray-matter@4.0.3 · typescript@**5.9.3** (بعد T1) · tailwindcss@4.3.3 · @tailwindcss/postcss@4.3.3 · eslint@10.12.0 · eslint-config-next@16.4.0 · prettier@3.9.10 · vitest@5.0.4 · @playwright/test@1.64.0 · @axe-core/playwright@4.14.0 · @types/node@26.6.5 · @types/react@19.3.0 · @types/react-dom@19.3.0 — كلها مطابقة لـ architecture §2 (ما عدا typescript بقرار T1 أدناه).
- تحذيرات ERESOLVE (11+): كلها **dev peers** — eslint-plugin-import/jsx-a11y/react ي declaring peer eslint ≤9 مع eslint@10 المثبَّت. **لم تمنع التثبيت ولا Lint** (أدناه) — تُراجع في بوابة الأمان إن لزم.
- سكربتات التثبيت الموقوفة (allow-scripts): `@swc/core` · `@parcel/watcher` · `unrs-resolver` — **لم تمنع البناء** (Turbopack يعمل) — تُوثَّق ولا تُعتمد كشرط.

### 3. `npm audit` — صراحة كاملة (لا إخفاء)
**9 ثغرات: 4 متوسطة · 5 عالية** — إصلاحها المتاح كاسر (`--force` يخفض حزمًا رئيسية) → **لا يُنفَّذ الآن**؛ يُسجَّل ويُحسم في بوابة الأمان (المرحلة 4):
| الثغرة | الشدة | السلسلة | ملاحظة تقييم |
|---|---|---|---|
| braces (DoS أنماط متداخلة) | high×5 طبقات | micromatch → fast-glob → @next/eslint-plugin-next → **eslint-config-next** | أداة lint تطويرية — ليست في مسار الإنتاج |
| sprintf-js (DoS مواصفات) | moderate×4 | argparse → js-yaml@3 → **gray-matter** | تحليل frontmatter وقت البناء فقط — سياسة المصدر الموثوق هي الضابط (requirements §8) لا التنقية |

### 4. السقالة (أول بناء)
ملفات: `package.json` (private + سكربتات dev/build/start/typecheck/lint) · `tsconfig.json` (عدّله Next تلقائيًا: `jsx: react-jsx` + include أنواع dev — سلوك إطار معتمد) · `next.config.ts` · `postcss.config.mjs` · `app/globals.css` (`@import "tailwindcss"`) · `app/[locale]/layout.tsx` (lang/dir ديناميكي + generateStaticParams) · `app/[locale]/page.tsx` · `eslint.config.mjs` (flat — core-web-vitals + typescript من eslint-config-next@16) · `.gitignore` · `scripts/use-node.ps1`.

### 5. فحوص T1 (TypeScript) — النتيجة الكاملة
| الفحص | TS 7.0.2 | TS 5.9.3 |
|---|---|---|
| `tsc --noEmit` | ✅ صفر أخطاء | ✅ صفر أخطاء |
| `next build` | ✅ نجح | ✅ نجح |
| `eslint .` | ❌ **فشل قاطع:** «typescript-eslint does not support TS 7.0» | ✅ صفر أخطاء |

**القرار:** اعتماد **typescript@5.9.3** (البديل المعتمد في T1 — Lint شرط قبول). السبب موثق في decisions-log T1.

### 6. أول خطأ وأصلحه (صدق التقارير)
- أول `next build` **فشل:** `Module not found: Can't resolve './globals.css'` — مسار import نسبي خاطئ من `app/[locale]/layout.tsx`. أُصلح بـ `../globals.css` — أعيد البناء ونجح.

### 7. الحالة النهائية لهذه الجولة — خضراء
| الفحص | النتيجة |
|---|---|
| `npm run typecheck` | ✅ صفر أخطاء (TS 5.9.3) |
| `npm run lint` | ✅ صفر أخطاء (eslint 10.12.0 + flat config) |
| `npm run build` | ✅ Compiled + SSG: `/_not-found` + `/ar` + `/en` |

---

## 2026-10-15 — جولة 2: i18n + السقالة + نظام 404 (منفَّذ ومُتحقَّق منه)

### 1. i18n موصول بالكامل (Q4-A)
- `i18n/routing.ts` (`defineRouting`: ar/en · default ar · `always` · `localeDetection:false` · `alternateLinks:true`) · `i18n/request.ts` (validation → `notFound()`) · `i18n/navigation.ts` (`createNavigation`) · `middleware.ts` (`createMiddleware`) · `next.config.ts` (`createNextIntlPlugin` + `experimental.globalNotFound`).
- `messages/ar.json` + `en.json`: مفاتيح متطابقة (أساس اختبار Q2-A) + نصوص الهوية **حرفيًّا** من `docs/identity/brand-board.html` (tagline/manifesto/quote/Mission/Vision/Story/Positioning).

### 2. السقالة والمكوّنات
- `app/[locale]/layout.tsx`: خطوط `next/font/google` + `NextIntlClientProvider` + `setRequestLocale` + skip-link + Header/Footer.
- الصفحات: `page.tsx` (hero بالنص الحرفي) · `articles/` (الحالة الفارغة + 5 تصنيفات) · `about/` (Mission/Vision/Story حرفيًا) · `contact|privacy|terms` (placeholders صادقة — لا بيانات مخترعة).
- `components/Header.tsx` (sticky + `<details>` للجوال) · `Footer.tsx` · `LangSwitcher.tsx` (يحافظ على المسار).
- `globals.css`: tokens الألوان + type scale + focus ring + skip-link + buttons + reduced-motion + container + font fallbacks (لأن `global-not-found` يتجاوز layout).

### 3. الخطوط — تثبيت وترخيص (شرط التوثيق عند التثبيت)
| العائلة | الأوزان المعتمدة (من سطر لوح الهوية 7) | الرخصة — مصدر التحقق الفعلي |
|---|---|---|
| Cormorant Garamond | 400/600 | `google/fonts` → `ofl/cormorantgaramond/OFL.txt` ✅ |
| Noto Naskh Arabic | 400/600 | `google/fonts` → `ofl/notonaskharabic/OFL.txt` ✅ |
| Inter | 400/500 | `google/fonts` → `ofl/inter/OFL.txt` ✅ |
| Noto Sans Arabic | 400/500 | `google/fonts` → `ofl/notosansarabic/OFL.txt` ✅ |

البنية المتغيّرة أربعة ملفات woff2 مُتحقَّق منها داخل HTML المبني (preloads) — تُخدَم ذاتيًّا بلا طلب خارجي وقت التشغيل.

### 4. نظام 404 — تحقيق كامل للشروط (شامل قرار «GET /fr → 404 لا 200»)
**التحقيق (سلسلة أسباب أُصلحت بالترتيب):**
1. كل 404 كان يُخدم `<html id="__next_error__">` بمحتوى flight-only (لا SSR) — لأن `not-found.tsx` كان server component.
2. أُعيد إلى النمط الرسمي next-intl: `app/not-found.tsx` **`'use client'`** بـ`<html>` كامل ثنائي اللغة.
3. `dynamicParams = false` في `app/[locale]/layout.tsx` → قيمة locale غريبة تصبح route-unmatched قبل تشغيل أي layout → boundary الجذر يركّب SSR.
4. `app/[locale]/[...rest]/page.tsx`: `dynamicParams = false` + `generateStaticParams() => []` → كل مسارات اللغات الصحيحة غير المعروفة تسقط للجذر.
5. `middleware.ts`: البادئات غير المعروفة تُعيد كتابة (`NextResponse.rewrite`) تحت `/ar` بدل redirect (307) الخاصة بـ next-intl → **`GET /fr` = 404 مباشراً مع بقاء الرابط** — شرط Q1-A #8 بقراءته الصارمة.

**الدليل (smoke فعلي على `next start` — قراءة UTF-8):** الحالة الآجالات الأربعة (`/fr` · `/unknown.txt` · `/deep/nested/path` · `/ar/nonexistent`):
`nextErrorShell=0 · h1=1 · noindex=1 · domAr=1 · domEn=1` — أي SSR ثنائي اللغة كامل بلا أي صفحة خطأ فارغة.

الحالات الأخرى: `/`→307 `/ar` · `/ar` `/en` 200 + tagline/skip · `/ar|/en/about` 200 + نص Mission حرفي · `/en/articles` 200 + التصنيفات · `/fr` (بدون متابعة) **404** · `/unknown.txt` 404.

### 5. ملاحظات صادقة
- `app/[locale]/not-found.tsx` غير موصول حاليًا (لا نداء `notFound()` داخل صفحات سارية) — يُستعمل عند بناء مسارات المقالات قادمة.
- `global-not-found` مبني وموصّل (`✓ globalNotFound`) لكن `data-global-not-found=0` فعليًا — `[locale]` يطابق كل مسار منفردًا؛ صفحة الجذر 'use client' هي الفاعلة.
- تحذير **Next 16.4**: «middleware file convention is deprecated → proxy» — يعمل حاليًا؛ الترحيل مؤجَّل حتى دعم next-intl (يُسجَّل في كل build).
- درس بيئة الاختبار: مخرجات PowerShell 5.1 تشويه العربية → كل اختبار لاحق يجب أن يقرأ UTF-8 (لا `Get-Content` افتراضي) أو يستدعي `grep.exe` من Git.
- ازدواج التحقق من locale: حذف validation من الـlayout (صار غير ممكن وصوله للقيم الغريبة) — `i18n/request.ts` بقي قلب دفاعيًا.

### 6. الحالة النهائية لهذه الجولة — خضراء
| الفحص | النتيجة |
|---|---|
| `npm run typecheck` | ✅ صفر أخطاء |
| `npm run lint` | ✅ صفر أخطاء |
| `npm run build` | ✅ Compiled + 14 صفحة SSG |
| smoke (`next start`) | ✅ كل الشروط أعلاه كما وُثّقت |

---

## 2026-10-16 — جولة 3: خط المحتوى MDX (T2 حُسم) + آلية التكافؤ Q2-A مُختبَرة

### 1. البنية المنفَّذة
| الملف | الدور |
|---|---|
| `content/{ar,en}/articles/*.mdx` | مصدر الحقيقة — frontmatter: `title` · `description` · `date` (YYYY-MM-DD) · `category` (من الخمسة D3-B) · `tags[]` · `draft` |
| `lib/content.ts` | قراءة `gray-matter` + تحقق صارم (حقول ناقصة/تاريخ غير تقويمي/slug غير kebab/تصنيف خارج القائمة → **خطأ يُسقِط البناء برسالة تحدد الملف**) + فهرس مرتّب + `getRelatedArticles` + **`assertArticleParity()` (Q2-A)** |
| `lib/mdx.tsx` | تجميع RSC عبر `next-mdx-remote/rsc` · روابط داخلية → `Link` من next-intl (تضيف locale) · خارجية → `<a rel="noopener noreferrer">` |
| `app/[locale]/articles/[slug]/page.tsx` | `dynamicParams=false` + `generateStaticParams` يستدعي فحص التكافؤ أولًا · breadcrumb (wireframes §4) · سطر التاريخ·التصنيف·الوسوم (بصيغة `2026-10-15` كما في السلك) · عمود قراءة `.prose-body` · ذات صلة (حتى 3، تختفي إن لم توجد) · مبدّل لغة · `generateMetadata` من frontmatter |
| `components/content/ArticleCard.tsx` | عنوان + وصف + تاريخ + تصنيف (design-system §مكوّنات) |
| `next.config.ts` | `transpilePackages: ["next-mdx-remote"]` — شرط Turbopack (توثيق الحزمة) |

### 2. الدليل: T2 — التجميع الفعلي مع Next 16
- `npm run build` خضر: **`/ar/articles/test-mdx-pipeline` + `/en/articles/test-mdx-pipeline` مُسبَّقتان SSG** (16 صفحة بدل 14).
- دخان على `next start`: `/ar|/en/articles/test-mdx-pipeline` → **200** مع `<strong>` و`<ul>` من MDX في الـHTML، رابط داخلي `href="/ar/articles"` (locale تمت إضافته تلقائيًا)، رابط خارجي `rel="noopener noreferrer"`، breadcrumb، `<title>` من frontmatter، `dir="rtl"`/`dir="ltr"`، مبدّل اللغة في ذيل المقال. الفهرس والرئيسية يعرضان البطاقة في اللغتين. `/fr/articles/whatever` → **404** (i18n كما في جولة 2).

### 3. الدليل: Q2-A — فشل البناء عند نقص نسخة لغة
1. أُضيف `content/ar/articles/orphan-no-en.mdx` (frontmatter صالح بلا مقابل en).
2. `npm run build` → **`exitCode=1`** والرسالة الفعلية:
   `[Q2-A] Article language parity violated — publishing requires every published slug to exist in both ar and en. Build blocked:` ثم `content/ar/articles/orphan-no-en.mdx exists — missing counterpart content/en/articles/orphan-no-en.mdx` ثم `Failed to collect page data for /[locale]/articles/[slug]`.
3. حُذف الملف → بناء خضر من جديد (16 صفحة).

### 4. حالتا صدق (لا ادّعاء محتوى)
- المقالان `test-mdx-pipeline` **محتوى تجريبي مُعلَّم صراحةً** في العنوان والوصف والنص — غايتهما فقط إثبات خط المحتوى. **يلزم حذفهما أو استبدالهما قبل بوابة النشر (E1)** — بند في قائمة ما قبل النشر.
- `Articles.empty` لا يظهر الآن في اللغتين (المقال التجريبي موجود فعليًا) — البطاقات مشتقة من نفس مصدر الحقيقة، فلا تناقض.

### 5. ملاحظات صادقة
- أول بناء بعد `transpilePackages` استغرق دقيقتين (Turbopack + حزم MDX) — لاحقًا يُعاد استخدام الذاكرة المؤقتة.
- `app/[locale]/not-found.tsx` بقي غير موصول (المقال المجهول يقع على boundary الجذر كما في جولة 2).
- `gray-matter` يقرأ الملفات وقت البناء فقط (لا تفاعل مستخدم → مخاطرة sprintf-js الموثّقة تبقى محدودة البناء، كما في جولة 1).
- اختبار التكافؤ يغطي المنشورة فقط (`draft: true` مستبعد من الفهرس والتكافؤ — كوثيقة architecture §5).

### 6. الحالة النهائية لهذه الجولة — خضراء
| الفحص | النتيجة |
|---|---|
| `npm run typecheck` | ✅ صفر أخطاء |
| `npm run lint` | ✅ صفر أخطاء |
| `npm run build` | ✅ Compiled + 16 صفحة SSG (بما فيها مقالا التجربة) |
| Q2-A orphan test | ✅ بناء ساقط `exitCode=1` برسالة صريحة ثم خضر بعد الإزالة |
| دخان المقالات | ✅ 200/200/404 + محتوى MDX مُتحقَّق منه في HTML |

---

## 2026-10-16 — جولة 4: SEO (sitemap · robots · canonical/hreflang · JSON-LD)

### 1. المنفَّذ
| الملف | الدور |
|---|---|
| `lib/seo.tsx` | `siteUrl()` من `NEXT_PUBLIC_SITE_URL` (افتراضيًا `http://localhost:3000` — **النطاق النهائي يُضبط قبل النشر عبر D2/E1 دون تغيير كود**) · `absoluteUrl`/`absolutePath` · `alternateLanguages` (ar + en + **x-default → ar**) · `pageMetadata` (canonical بلغة الصفحة + alternates) · مولّدات JSON-LD: `WebSite` · `BreadcrumbList` · `Article` · `JsonLdScript` |
| `app/sitemap.ts` | 14 سجلًا: 6 صفحات ثابتة × لغتان + المقالات المنشورة × لغتان — كل سجل بـ`xhtml:link` alternates (ar/en/x-default) من نفس فهرس `lib/content.ts` |
| `app/robots.ts` | `User-Agent: *` + `Allow: /` + `Sitemap: {SITE_URL}/sitemap.xml` |
| `app/[locale]/layout.tsx` | `metadataBase` + عنوان افتراضي + قالب `%s — NOUJOUDE — نجود` (اسم العلامة حرفيًّا من messages) + وصف الموقع — بلغة كل صفحة |
| صفحات السقالة الست + `[slug]` | `generateMetadata` خاص بكل صفحة (العناوين من `messages` نفسها — لا ترجمة آلية، شرط requirements §111) |

### 2. الدليل (دخان فعلي على `next start`)
- `/sitemap.xml` 200: 14 `<url>` — كل واحد بثلاثة `xhtml:link` (ar/en/x-default) — يشمل مسارَي المقال التجريبي بلغتيهما.
- `/robots.txt` 200: `Allow: /` + `Sitemap: http://localhost:3000/sitemap.xml`.
- `/ar/about`: `<link rel="canonical" href="…/ar/about">` + `hrefLang` alternates الثلاثة + `<title>عن المنصة — NOUJOUDE — نجود</title>`.
- `/en/about`: canonical `…/en/about` + `<title>About — NOUJOUDE — نجود</title>`.
- `/ar` (الرئيسية): JSON-LD `WebSite` (name/description/url/inLanguage).
- `/ar/articles/test-mdx-pipeline`: JSON-LD `BreadcrumbList` (3 عناصر بالمسارات الدائمة) + `Article` (headline/description/datePublished/inLanguage/url).
- `npm run build` خضر (18 صفحة — سايت ماب + روبوتز أُضيفا).

### 3. ملاحظات صادقة
- `hrefLang` (كامل الحروف في HTML) هو ترميز React/Next القياسي — المتصفحات وcrawleres تقرأه بلا تمييز حساس لحالة الحروف.
- JSON-LD على صفحات المقالات والرئيسية فقط حاليًا (كما تتطلب requirements: WebSite + BreadcrumbList + Article) — لا JSON-LD مخترع لصفحات أخرى.
- `lastModified` في السايت ماب = تاريخ frontmatter للمقالات وتاريخ البناء للصفحات الثابتة.
- صفحات 404 بلا canonical (noindex كافٍ — مُتحقَّق منه في جولة 2).

### 4. الحالة النهائية لهذه الجولة — خضراء
| الفحص | النتيجة |
|---|---|
| `npm run typecheck` | ✅ صفر أخطاء |
| `npm run lint` | ✅ صفر أخطاء |
| `npm run build` | ✅ 18 صفحة (16 + sitemap + robots) |
| دخان SEO | ✅ كما وُثّق أعلاه |

---

## 2026-10-16 — جولة 5: بنية الاختبارات الوحدية (Vitest) — 26/26 ناجحة

### 1. المنفَّذ
| الملف | الدور |
|---|---|
| `vitest.config.ts` | بيئة node · تضمين `tests/unit/**/*.test.{ts,tsx}` · alias `@` |
| `package.json` | سكربت `test: vitest run` |
| `lib/content.ts` | تعديل صغير: بارامتر اختياري `root` لدوال القراءة (للاختبار على محتوى مؤقت معزول — السلوك الافتراضي كما هو) |
| `tests/unit/messages-parity.test.ts` | تطابق مفاتيح ar/en (أساس D4/Q2-A) + تطابق حرفي لاسم العلامة |
| `tests/unit/routing.test.ts` | قرارات Q4-A: locales/default/prefix/detection |
| `tests/unit/content-validation.test.ts` | 11 اختبارًا: frontmatter صالح · حقل ناقص يسقط · تاريخ غير تقويمي · تصنيف خارج الخمسة · slug غير kebab · draft مستبعد من الفهرس · الفرز تنازليًا · **Q2-A: تكافؤ ينجح · ar-يتيم يفشل بالمسار · en-يتيم يفشل · drafts خارج التكافؤ** |
| `tests/unit/seo.test.ts` | 8 اختبارات: `siteUrl` (localhost + env مع قصّ الشرطات) · hreflang الثلاثي · canonical بلغة الصفحة · sitemap: 12 ثابتة + 2 لكل مقال + alternates على كل سجل + العدد الكلي |
| `tests/unit/mdx.test.tsx` | تجميع MDX فعلي عبر `renderToReadableStream` (يدعم المكوّنات غير المتزامنة): بنية markdown · رابط داخلي عبر Link · خارجي بـ`rel` — مع محاكاة `@/i18n/navigation` |

### 2. الدليل (أوامر مُشغَّلة فعليًا)
- `npm test` → **5 ملفات · 26/26 اختبارًا ناجحًا** (5.44s).
- `npm run typecheck` ✅ صفر أخطاء (الاختبارات داخل نطاق tsc).
- `npm run lint` ✅ صفر أخطاء.
- `npm run build` ✅ 18 صفحة خضراء.

### 3. ملاحظات صادقة
- اختبارات MDX تُحقن `renderToReadableStream` لأن `renderToStaticMarkup` لا يدعم المكوّنات غير المتزامنة (MDXRemote RSC) — الأول نجح، الثاني سقط ثم عُوّض (سجل صدق: 3 إخفاقات ثم إصلاح ثم أخضر).
- **لا ادّعاء تغطية (coverage %)** — لم يُقَس نسبة التغطية ولا تُذكر.
- اختبارات e2e/WCAG (Playwright + axe + المراجعة اليدوية) **غير منفَّذة** — لها بوابة المرحلة 5؛ لم يُثبَّت بعد متصفحات Playwright.
- تحذير Vite غير حاسم حول تحميل `vitest.config.ts` كـESM-in-CJS — الاختبارات تعمل؛ يُراجع عند أي تحديث كبير.

### 4. الحالة النهائية لهذه الجولة — خضراء
| الفحص | النتيجة |
|---|---|
| `npm test` | ✅ 26/26 |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |
| `npm run build` | ✅ 18 صفحة |

---

## 2026-10-16 — جولة 6: بوابة المرحلة 4 (الأمان) — P4-A منفَّذة

**التقرير الكامل:** `docs/phase4/audit-report.md` — الملخص المنفَّذ هنا:

### 1. المنفَّذ
- **ترويسات `next.config.ts`:** nosniff · Referrer-Policy · X-Frame-Options DENY · Permissions-Policy (8 صفر) · HSTS (بدون includeSubDomains) · **CSP report-only** كاملة (`frame-ancestors 'none'` داخلها + X-Frame-Options يؤمّنها أثناء التقييم) + `Reporting-Endpoints`.
- **`POST /api/csp-report`:** حد 10KB · تسجيل في سجل الخادم فقط · 204 — بلا تخزين ولا خدمة خارجية.
- **`localeCookie: false`** في `i18n/routing.ts` — إلغاء كوكيز `NEXT_LOCALE` (كان يُضبط افتراضيًّا رغم Q4-A «كوكى لم يُعتمد») — إعادة الفحص: **`Set-Cookie = <absent>`** والارتداد كله سليم.
- **Prettier:** إعداد `.prettierrc` + `.prettierignore` (docs لحماية ختم اللوح · content لحرفيّة النصوص) → **صفر تنبيهات** (§214).
- **وحدة اختبار جديدة:** `tests/unit/security-headers.test.ts` (تُسقط إن غابت ترويسة أو إن ظهر CSP إلزامي مبكرًا).

### 2. الفحوصات والنتائج (كلها فعلية)
| الفحص | النتيجة |
|---|---|
| ترويسات على `next start` | ✅ كلها كما في الجدول أعلاه · sitemap.txt أيضًا |
| `POST /api/csp-report` | ✅ 204 |
| `Set-Cookie` | ✅ غائب بعد `localeCookie: false` |
| أسرار (أنماط + ملفات env) | ✅ صفر نتائج · لا `.env` |
| خدمات تتبّع خارجية | ✅ صفر نتائج |
| `localStorage`/`document.cookie` | ✅ صفر نتائج |
| `npm audit` | ⚠️ **9 (4 متوسطة/5 عالية)** — التقرير كامل بلا إخفاء في `docs/phase4/audit-report.md` مع تبرير كل high (dev-only/build-only) · `npm audit fix` (غير الكاسر) جُرّب = «up to date» لا شيء قابل للإصلاح |
| allow-scripts | ✅ **حُسم: لا حاجة لموافقة** — `next dev` اختُبر يعمل مع بقاء السكربتات الثلاثة محظورة |
| ارتداد شامل | ✅ `/`→307→`/ar` · الصفحات 200 · 404 كما كانت |
| typecheck/lint/test/build | ✅ خضراء (28/28) |

### 3. البنود المفتوحة (مُوثّقة في التقرير §9)
تفعيل CSP الإلزامي بعد مراجعة report-only · HSTS الشامل مع D2 · HTTPS من E1 · تحليلات خارج النطاق حتى موافقة.

---

## 2026-10-16 — جولة 7: إغلاق المراحل 0–3 (امتثال شامل)

**التقرير الكامل:** `docs/phase3/gate-p3-report.md` — مراجعة صارمة لكل متطلبات §2–§9 + وثائق phase0/1/2 ثم إغلاق الفجوات المُكتشفة:

### 1. الفجوات المُغلقة
| # | الفجوة | الإصلاح |
|---|---|---|
| 1 | فلاتر المقالات كانت `<span>` ميتة (wireframe §89 يوجب روابط قابلة للمشاركة) | فلاتر `?category=` `?tag=` بروابط + `aria-current` + مسح الفلاتر (`app/[locale]/articles/page.tsx` + `lib/archive.ts`) |
| 2 | لا عدّاد نتائج ولا ترقيم | `resultsCount` ICU (5 صيغ عربية) + clamp للصفحات الخارجية + تحميل المزيد (جوال) + أرقام (≥768) — حجم12 بقرار T6 |
| 3 | وصف meta موروث مكرر بين الصفحات (§151 يوجب الفردة) | 6 مفاتيح وصف جديدة بلغة كل صفحة |
| 4 | لا Open Graph/Twitter (§156 إلزامي) | `pageMetadata` يولّد og+twitter لكل الصفحات · المقالات `article:published_time` — **أُصلح شكل Next16 المسطح (T7)** وأُثبت دخانيًا |
| 5 | `tags` اختيارية رغم §104 «مطلوب حد أدنى1» | validator: إلزامية ≥1 + رفض الفارغ/المسافة + `cover` اختياري مدعوم + 5 اختبارات |
| 6 | About يعرض Mission/Vision إنجليزيًا في الصفحة العربية (مخالفة D4) | مفتاحان `missionTitle`/`visionTitle` بلغة كل صفحة |
| 7 | لا نص ترحيب في تواصل (wireframe §6) | `Contact.welcome` ثنائي اللغة (بلا ادّعاء مواعيد/بريد) |
| 8 | Footer يفتقد عن/تواصل (wireframe §26) | أُضيفا |
| 9 | لا قسم أخضر متناوب (design §119) | قسم التصنيفات/الاقتباس `bg-green on-dark` + override عناوين أبيض |
| 10 | شبكات غير مطابقة | رئيسية md2/lg3 (768=2·1440=3) · أرشيف md2/xl4 (1440=4) |
| 11 | لا TagList component (design §5 §117) | `components/content/TagList.tsx` بروابط تصفية الوسوم (تدفّق wireframe §10) |
| 12 | لا أيقونة موقع | `app/icon.png` من الشعار المعتمد (لا صور مولَّدة) |
| 13 | روابط وسوم/وسوم مقال غير مترابطة | سلك metadata يعرض الوسوم كروابط فلترة |

### 2. الفحوصات (كلها فعلية)
| الفحص | النتيجة |
|---|---|
| SHA-256 لوح الهوية | ✅ أُعيد التحقق: `3E28B776…C1BA3` مطابق |
| prettier / typecheck / lint | ✅ صفر |
| `npm test` | ✅ **47/47 في 7 ملفات** (أرشيف + OG/Twitter + tags/cover جديدة) |
| `npm run build` | ✅ 20 مسارًا (أيقونة + أرشيف ديناميكي بحقل searchParams) |
| دخان `next start` | ✅ **20/20**: فلترة عربية·عدّاد·وسم عربي·تصفية فارغة·مسح·شبكات·og/locale·article:published_time·favicon·404 (/fr وغيره)·عناوين about·ترحيب contact·وصف privacy/terms·en-count |

### 3. قرارات هذه الجولة (موثقة في decisions-log §5)
T5: قائمة جوال `<details>` بلا JS · T6: حجم صفحة12 + تحميل المزيد رابط · T7: شكل Next16 المسطح للـOG.

---

## الخطوات التالية (غير منفَّذة بعد)
1. **اعتماد المدير لإغلاق المراحل 0–3** (`docs/phase3/gate-p3-report.md`) + تفويض بوابة المرحلة 5 (إن رُغب).
2. **بوابة المرحلة 5 (الاختبارات):** تحميل متصفحات Playwright · سيناريوهات e2e (تنقّل/تبديل لغة/RTL-LTR/مقال/404/جوال · فلاتر المقالات) · axe-core (صفر critical+serious) · فحص روابط داخلي آلٍ · قائمة مراجعة WCAG اليدوية · Lighthouse ≥90.
3. **مراجعة CSP report-only** (ضمن المرحلة 5) → قرار التفعيل الإلزامي.
4. ترحيل middleware→proxy عند توفر دعم next-intl · مراجعة `next/root-params` عند next-intl.
5. **قبل النشر (E1):** ضبط `NEXT_PUBLIC_SITE_URL` بالنطاق النهائي (D2) · HSTS الشامل · HTTPS من المنصة · حذف/استبدال مقالَي التجربة · المحتوى القانوني · قنوات الاتصال (بريد mailto) · تقييم og:image بصورة وجهة حقيقية ≥200×200.
