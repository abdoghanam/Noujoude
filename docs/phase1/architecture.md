# المرحلة 1 — الوثيقة المعمارية

- **الحالة:** المرحلة 1 موثقة (GATE-P1-2026-10-14 · P2-A) · **المرحلة 2 موثقة — GATE-P2-2026-10-14 (شروطه اُسددت 2026-10-15)** · **المرحلة 3 (التنفيذ) معتمدة بـ P3-A (2026-10-15) — قيد التنفيذ.**
- **التصنيف:** ✅ مؤكد/معتمد (قرار رسمي) | 💡 توصية تحتاج اعتمادًا | ⚠️ مخاطر/قيود | ❓ `NEEDS USER INPUT` (مؤجل بقرار)
- سجل القرارات التفصيلي: `docs/phase1/decisions-log.md`

---

## 1. لماذا هذه المعمارية (البرهان)

| الاختيار | السبب | البديل المرفوض وسببه |
|---|---|---|
| **Next.js 16 (App Router)** | مطلوب صراحة في الحوكمة؛ SSG/SSR ممتاز لـ SEO؛ توليد sitemap/metadata ديناميكي؛ Rendering حديث عبر RSC | Gatsby/Astro: خروج عن الحوكمة بدون سبب موثق |
| **Static-first** (كل الصفحات SSG) | موقع محتوى بلا ديناميكية → أسرع، أرخص، ويقلل سطح الهجوم المرتبط بالخادم (لا خادم ديناميكي يعمل في الإنتاج) | ISR/SSR كامل: غير مطلوب |
| **TypeScript** | مطلوب في الحوكمة؛ أمان الأنواع في i18n وMDX pipeline | JS خالٍ: يخسر قيمة الحوكمة |
| **Tailwind CSS v4** | مطلوب؛ v4 يستخدم CSS-first config (`@theme`) — أنسب لدعم RTL عبر CSS logical properties | CSS Modules: أبطأ تطويرًا |
| **MDX لل Content** | مطلوب؛ المحتوى = ملفات نصية في المستودع → versioned, reviewable, لا قاعدة بيانات | CMS خارجي: خدمة خارجية تحتاج موافقة + حسابات |
| **next-intl v4** | الأفضل دعمًا لـ App Router؛ hreflang، تبديل مسارات، رسائل ثابتة | i18n يدوي: سهولة أعلى لكن أخطاء بشرية أكثر |

### ⚠️ ملاحظة "2028" من الطلب الأصلي
طلبك ذكر "تقنيات 2028". لا يمكن التحقق من مستقبل 2028؛ لذلك نعتمد **أحدث الإصدارات المستقرة الموثقة من npm registry اليوم (2026-10-14)** وتثبيتها بـ lockfile. المستندات مصممة لترقية الإصدارات لاحقًا (Minor/Patch تلقائي، Major بفحص).

---

## 2. مكدس التقنيات (موثقة من npm registry — 2026-10-14)

| الطبقة | الحزمة | الإصدار الأحدث | ملاحظات التوافق |
|---|---|---|---|
| Runtime | Node.js | **v24.19.0 LTS** (مثبَّت) | ≥ 20.9.0 المطلوب لـ next ✅ |
| Framework | `next` | 16.4.0 | — |
| UI | `react` / `react-dom` | 19.3.0 | يطابق peerDeps (`^19.0.0`) ✅ |
| Language | `typescript` | 7.0.2 | ⚠️ إصدار جديد (native port) — يُفحص التوافق مع next/eslint في المرحلة 3؛ بديل: أحدث 5.x/6.x. القرار يُوثَّق. |
| CSS | `tailwindcss` + `@tailwindcss/postcss` | 4.3.3 | — |
| i18n | `next-intl` | 4.14.9 | ✅ معتمد رسميًا (Q4-A) |
| MDX | `next-mdx-remote` (RSC) + `gray-matter` 💡 | يُثبَّت في المرحلة 3 | بديل: `@next/mdx` — يُقرر حسب بنية content |
| Lint | `eslint` | 10.12.0 | ⚠️ يُتحقق من توافقه مع `eslint-config-next` |
| Format | `prettier` | 3.9.10 | — |
| Unit | `vitest` | 5.0.4 | — |
| E2E | `@playwright/test` | 1.64.0 | — |
| A11y | `@axe-core/playwright` 💡 | يُثبَّت في المرحلة 3 | — |

> كل الأرقام أعلاه مأخوذة حيًّا من `registry.npmjs.org` بتاريخ 2026-10-14 — قابلة للتحقق.

---

## 3. هيكل المشروع المقترح

```text
D:\NUOJED/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # <html lang dir> + Header/Footer + next-intl provider
│   │   ├── page.tsx                # الرئيسية
│   │   ├── articles/
│   │   │   ├── page.tsx            # أرشيف المقالات
│   │   │   └── [slug]/page.tsx     # مقال واحد
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── sitemap.ts                  # مولّد باللغتين + hreflang
│   ├── robots.ts
│   ├── rss.xml/route.ts            # 💡 اختياري
│   └── not-found.tsx / [locale]/not-found.tsx   # 404 فعلية لأي مسار غير مطابق — لا مسار /404 مستقل
├── components/                     # مكونات UI قابلة لإعادة الاستخدام
│   ├── layout/ (Header, Footer, LangSwitcher, MobileNav)
│   └── content/ (ArticleCard, Prose, TagList, …)
├── content/
│   ├── ar/articles/*.mdx
│   └── en/articles/*.mdx
├── messages/
│   ├── ar.json
│   └── en.json
├── lib/
│   ├── i18n.ts                    # locales, locale detection
│   ├── content.ts                 # قراءة MDX + frontmatter + تحقق اللغات
│   ├── seo.ts                     # مولّد metadata + hreflang + JSON-LD
│   └── mdx.ts                     # تجميع MDX pipeline
├── public/                        # صور، favicons، og images
├── scripts/
│   └── use-node.ps1               # تهيئة PATH للجلسة (بند C — الخيار 1)
├── tests/
│   ├── unit/                      # Vitest
│   └── e2e/                       # Playwright (+axe)
├── docs/                          # هذه الوثائق
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## 4. قرارات i18n المعمارية — Q4-A معتمد

### ✅ القرارات المعتمدة رسميًا (Q4-A + D4)

| المسألة | القرار المعتمد |
|---|---|
| المكتبة | **`next-intl@4`** |
| Routing | `app/[locale]/...` مع `locales: ['ar','en']`، ومسارات **`/ar/...` و `/en/...`** |
| توجيه `/` | **تحويل المسار `/` إلى `/ar` افتراضيًا** (التوجيه حسب `Accept-Language` مع كوكى **لم يُعتمد**) |
| تساوي اللغتين (D4) | **اللغتان متساويتان في الأهمية** من حيث جودة UX والتصميم — العربية لغة التوجيه الافتراضي فقط وليس لها أولوية في المحتوى أو العمق التصميمي |

### 💡 توصيات غير معتمدة (لا تؤثر على اعتماد Q4)

| المسألة | التوصية |
|---|---|
| المحتوى | فهرس مقالات يُبنى وقت `next build` من `content/{locale}/articles` |
| التحقق | اختبار وحدة يفشل البناء إن نقصت نسخة لغة لأي slug منشور (**شرط نشر — Q2-A**) |
| الصفحات الثابتة | JSON في `messages/` — تُترجم يدويًا (لا آلية) |

---

## 5. خط المحتوى (Content Pipeline)

```text
MDX file → gray-matter (frontmatter) → compile (MDX) → RSC render
                ↓
        validate (required fields, date parse, slug pattern)
                ↓
        index { slug, locale, title, description, date, tags } → list pages / sitemap / rss
```

- الأخطاء (frontmatter ناقص، تاريخ غير صالح) → **فشل البناء** مع رسالة واضحة (لا نشر لمحتوى معطوب).
- **فحص التكافؤ (Q2-A — شرط نشر إلزامي):** قبل البناء، يُتحقق من أن لكل slug منشور في `ar/` نسخة مقابلة في `en/` (وبالعكس). أي نسخة مفقودة → **فشل البناء** برسالة تحدد المقال واللغة الناقصة. لا استبعاد صامت ولا نشر لمقال ناقص.
- **مصدر المحتوى (سياسة صريحة):** لا يُجمَّع أو يُعرض أي MDX إلا من مصدر موثوق داخل المستودع — مؤلفون معروفون، مراجعة عبر pull request. **التنقية (sanitization) لا تُعتمد كحماية عامة** للمحتوى غير الموثوق؛ الضابط الأساسي هو مصدر الموثوقية لا التنقية.
- `draft: true` → مستبعد من الإنتاج، مسموح في المعاينة.

---

## 6. استراتيجية SEO المعمارية

- `generateMetadata()` على كل صفحة باللغة الحالية.
- hreflang عبر `alternates.languages` + `x-default`.
- `sitemap.ts` يجمع الصفحات من نفس فهرس المحتوى (مصدر واحد للحقيقة).
- JSON-LD يُبنى من بيانات الصفحة/المقال.

---

## 7. الأمان في المعمارية

- ✅ لا `.env` مطلوب للنسخة الأولى (لا أسرار أصلًا).
- الترويسات تُضبط في `next.config.ts` headers (تعمل مع SSG على Vercel/CF).
- CSP: تُبنى تدريجيًا (report-only → enforce) في المرحلة 4.
- التبعيات: lockfile + `npm audit` في بوابة القبول.

---

## 8. أداء متوقع (توقعات — لا تُقاس قبل البناء)

- SSG كامل → LCP منخفض (استاتيك + خطوط محلية self-hosted).
- الخطوط: **معتمدة ضمن هوية P2-A:** عرض لاتيني `Cormorant Garamond` · عرض عربي `Noto Naskh Arabic` · نص لاتيني `Inter` · نص عربي `Noto Sans Arabic` (كلها مفتوحة المصدر — تُتحقق الرخصة والتقطيع عند التثبيت في المرحلة 3). تُقيَّم الأوزان والـ subset مع LCP في Phase 5.
- صور: `next/image` + أبعاد ثابتة.

---

## 9. مخاطر معمارية

| # | المخاطرة | الأثر | المعالجة |
|---|---|---|---|
| 1 | TS 7.0.2 قد يتعارض مع eslint-config-next/next | بناء فاشل | يُثبَّت TS، يُشغَّل `tsc`؛ إن فشل → أنشر أنسب إصدار موثقًا |
| 2 | eslint 10 قد يسبق دعم next config | lint فاشل | استخدام flat config المتوافق؛ إن تعذّر → توثيق سبب التخفيض |
| 3 | next-mdx-remote قد يتأخر عن next 16 | تجميع MDX فاشل | بديل: `@next/mdx` أو `@mdx-js/mdx` يدوي — يُوثَّق السبب |
| 4 | ملفات system32 التالفة تحجب node/npm في PowerShell | أوامر فاشلة | آليات مُختبَرة في المرحلة 0: (أ) cmd.exe يتجاوز الملفات بلا امتداد ✅، (ب) prepend مؤقت للـ PATH في الجلسة عبر `scripts/use-node.ps1` (**مقترح — غير منشأ بعد**)، (ج) مسارات صريحة كاملة. لا حذف لملفات النظام. التفاصيل: `toolchain-node-plan.md` |
| 5 | حجم الخط العربي يؤثر LCP | أداء | تقييم في Phase 5 + subset fonts |

---

## 10. معايير قبول المعمارية

1. ✅ كل تقنية متوافقة مع قيود الحوكمة (Next/TS/Tailwind/MDX/أدوات الاختبار).
2. ✅ الإصدارات موثقة ومأخوذة من مصدر قابل للتحقق.
3. 💡 كل توصية موسومة — لا شيء يُنفَّذ قبل الاعتماد.
4. ✅ لا خدمات خارجية، لا قواعد بيانات، لا أسرار.

> حالات القرارات (Q1–Q4 · D1–D5 · E1 · T1–T3) ليست معايير قبول — التفصيل في `decisions-log.md` (المرجع الوحيد).
