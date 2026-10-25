# المرحلة 4 — تقرير الأمان والخصوصية (P4-A · 2026-10-16 · مُحدَّث 2026-10-17)

- **المرجع:** P4-A (تفويض المدير 2026-10-16: «اعتمد بوابة المرحلة 4») · requirements §8 · architecture §7 · P5-A (2026-10-17: «أكمل المهام الناقصة والثغرات»).
- **قاعدة التقرير:** كل نتيجة هنا من أمر أو فحص مُشغَّل فعليًا — التقرير ينشر كل النتائج بلا إخفاء.

---

## 1. الترويسات (requirements §197) — منفَّذة ومُتحقَّق منها على `next start`

| الترويسة | القيمة | الحالة |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | ✅ مُتحقَّق |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ مُتحقَّق |
| `X-Frame-Options` | `DENY` (يؤمّن `frame-ancestors 'none'` ضمن السياسة الإلزامية) | ✅ مُتحقَّق |
| `Permissions-Policy` | تعطيل: accelerometer · camera · geolocation · gyroscope · magnetometer · microphone · payment · usb | ✅ مُتحقَّق |
| `Strict-Transport-Security` | `max-age=31536000` (بدون `includeSubDomains`/`preload` — قرار محافظ يُعاد تقييمه عند النطاق النهائي D2) | ✅ مُتحقَّق |
| `Content-Security-Policy` (إلزامي) | **مُفعَّل اعتبارًا من 2026-10-17** — سياسة كاملة (`default-src 'self'` · `object-src 'none'` · `frame-ancestors 'none'` · `base-uri 'self'` · `form-action 'self'` · `img-src 'self' data:` · `style-src 'self' 'unsafe-inline'` · `script-src 'self' 'unsafe-inline'` · `font-src 'self'` · `connect-src 'self'`) + `report-uri /api/csp-report` + `report-to csp-endpoints` | ✅ مُتحقَّق فعليًا عبر `Invoke-WebRequest` (ترويسة الإلزامي حاضرة · ترويسة Report-Only غائبة) |
| `Content-Security-Policy-Report-Only` | **محذوفة** — التحول من report-only إلى enforce مُوثَّق في §9.1 | ✅ مُتحقَّق |
| `Reporting-Endpoints` | `csp-endpoints="/api/csp-report"` | ✅ مُتحقَّق |
| `Set-Cookie` | **غائب** (انظر §2) | ✅ مُتحقَّق |

- **قرار CSP الإلزامي (2026-10-17):** نُفِّذ بعد مراجعة تقارير report-only (لم تصل أي تقارير مخالفة عبر اختبارات المرحلة 5 والتصفح الفعلي). `'unsafe-inline'` محفوظ للسكربتات التضمّنية (RSC payload + JSON-LD ديناميكي) والتنسيقات التضمّنية — لأن الصفحات SSG ثابتة ولا تدعم nonce بدون تحويل كامل إلى التصيير الديناميكي (يُوثَّق هذا التنازل في §9.1).
- نقطة إرسال التقارير: `POST /api/csp-report` — يستقبل بحد أقصى 10KB، يسجّل حجم التقرير في سجل الخادم فقط، لا تخزين ولا خدمة خارجية، يعيد **204** (مُتحقَّق فعليًا).
- وحدة اختبار: `tests/unit/security-headers.test.ts` (تُسقط الاختبار إن غابت ترويسة CSP الإلزامية أو إن بقيت Report-Only).

## 2. الكوكيز والتخزين (§201–203)

- **ملاحظة صادقة:** فحص الدخان وجد `Set-Cookie: NEXT_LOCALE=ar` رغم `localeDetection: false` — سببها خيار next-intl `localeCookie` الافتراضي `true` (المصدر: `next-intl/dist/.../routing/config.js`).
- **القرار:** `localeCookie: false` في `i18n/routing.ts` — لأن Q4-A معتمد «التوجيه حسب Accept-Language **مع كوكى لم يُعتمد**» والكوكيز غير ضروري (الروابط مسبوقة باللغة + `/` → `/ar` ثابت). **إعادة الفحص: `Set-Cookie = <absent>` ✅** (الارتداد والصفحات كلها سليمة بعد التغيير).
- لا `localStorage`/`sessionStorage`/`document.cookie` في الكود: فحص grep = **صفر نتائج** ✅.
- لا كوكيز تتبّع ولا خدمات خارجية (§202): فحص أنماط gtag/googletagmanager/plausible/umami/matomo/hotjar/fbq = **صفر نتائج** ✅.

## 3. الأسرار (§191)

- فحص أنماط (AKIA… · sk-… · ghp_… · xox… · BEGIN … PRIVATE KEY · password= · api_key=) على كامل الكود والملفات الإعدادية (بدون `docs/` و`node_modules/` و`.next/`): **صفر نتائج** ✅.
- لا `.env` ولا `.env.local` في المستودع ✅ (لا أسرار أصلًا — architecture §7).

## 4. التبعيات — `npm audit` (تقرير كامل بلا إخفاء · §199 + §225)

**النتيجة الفعلية (بعد فحص الإصدارات المُثبَّتة 2026-10-17):** 9 ثغرات (4 متوسطة · 5 عالية) — **لا يوجد إصلاح متاح حاليًّا** (لا إصدار مُصلِّح منشور بعد لأيٍّ من الثغرتين الجذريتين).

### 4.1 `braces` — عالية (سلسلة dev/lint كاملة)
- **الثغرة:** GHSA-vfj7-8cjw-p6xm — استنزاف مكدسة (DoS) بأنماط متداخلة بعمق. النطاق المصاب: **≤3.0.3** — الإصدار المُثبَّت **3.0.3** (أحدث إصدار منشور على npm registry، آخر تحديث 2024-05-21).
- **السلسلة:** `braces` ← `micromatch` ← `fast-glob` ← `@next/eslint-plugin-next` ← **`eslint-config-next`**.
- **التصنيف:** **أدوات تطوير فقط** — لا يدخل حزمة الإنتاج إطلاقًا (تشغيله على ملفات المستودع فقط).
- **الإصلاح غير الكاسر:** `npm audit fix` (بدون `--force`) → **«up to date» — لا يوجد إصلاح تلقائي**.
- **الإصلاح الكاسر المطلوب:** `eslint-config-next@14.2.35` (تخفيض كبير — يكسر lint مع Next 16 ويتجاوز شرط Lint في معايير القبول §215).
- **وضع الإصدارات المُثبَّتة (مُتحقَّق 2026-10-17):** `braces@3.0.3` — لا إصدار 3.0.4+ منشور حتى تاريخ التقرير (فحص `npm view braces versions` + `https://registry.npmjs.org/braces`).
- **التبرير (يبقى موثقًا):** المهاجم يحتاج للتحكم في الملفات المفحوصة = مساهمو المستودع فقط (مصدر موثوق — §200)؛ الأداة لا تعمل في الإنتاج ولا على طلب مستخدم. الثغرة غير قابلة للاستغلال عبر الشبكة (يُشغَّل فقط على ملفات المشروع).
- **قرار:** تُبقى الثغرة مُبرَّرة غير مُصلَّحة — لا `--force` دون موافقة. المراجعة: عند كل ترقية لـ eslint-config-next أو عند صدور braces@3.0.4+.

### 4.2 `sprintf-js` — متوسطة (سلسلة build-time للمحتوى)
- **الثغرة:** GHSA-hp3w-g68c-fv3c — DoS بمواصفات دقة غير محدودة. النطاق المصاب: **≤1.1.3** — الإصدار المُثبَّت **1.0.3** (أحدث إصدار منشور 1.1.3، لكن لا إصدار 1.1.4+ منشور حتى تاريخ التقرير).
- **السلسلة:** `sprintf-js` ← `argparse` ← `js-yaml@3` ← **`gray-matter`**.
- **التصنيف:** **وقت البناء فقط** — تحليل frontmatter لملفات MDX داخل المستودع (سياسة المصدر الموثوق §200؛ لا محتوى من الزوار).
- **وضع الإصدارات المُثبَّتة (مُتحقَّق 2026-10-17):** `gray-matter@4.0.3` ← `js-yaml@3.15.2` ← `argparse@1.0.10` ← `sprintf-js@1.0.3`.
- **الإصلاح غير الكاسر:** لا يوجد (`npm audit fix` لا يطبق شيئًا).
- **الإصلاح الكاسر المطلوب:** `gray-matter@2.0.1` (تخفيض كاسر — API قديم، يكسر استدعاءات `safeLoad`/`safeDump`).
- **التبرير:** لا مسار للتشغيل في الإنتاج؛ صيغ التنسيق تأتي من محتوى موثوق ومُراجع. الثغرة تتطلب تحكّمًا في سلسلة التنسيق (صيغة YAML frontmatter) وهي محتوى موثوق فقط (§200).
- **قرار:** مُبرَّرة غير مُصلَّحة — تُراجَع عند توفّر gray-matter مُحدَّث يتجاوز js-yaml@3 أو عند صدور sprintf-js@1.1.4+.

**المعيار (§225): «لا ثغرات critical/high غير مبرَّرة»** — ثغرتا `high` كلهما مبرَّرتان بالتصنيف أعلاه (dev-only / build-time فقط) · لا `critical` إطلاقًا · `npm audit fix` غير الكاسر جُرّب وسجّل ناتجه («up to date») · لا إصدار مُصلِّح منشور لأيٍّ من الثغرتين حتى تاريخ التقرير (فحص npm registry + GitHub Advisory).

## 5. allow-scripts (بند معلّق من المرحلة 3) — **حُسم: لا حاجة لموافقة**

- السكربتات الثلاثة المعلّقة: `@swc/core` (postinstall) · `@parcel/watcher` (node-gyp) · `unrs-resolver` (postinstall).
- **الدليل العملي:** كل السكربتات **محظورة** والآتي يعمل كله فعليًا: `next build` (بناؤات عديدة) ✅ · `tsc` ✅ · `eslint` ✅ · `vitest` 28/28 ✅ · **`next dev` اختُبر الآن: يشتغل ويخدم `/ar` بـ200 وrtl ✅**.
- **قرار:** تبقى المحاكمة محظورة (لا `npm approve-scripts` — لا موافقة مطلوبة). تُفتح بندًا بندًا عند ظهور فشل يُعزى إليها، بطلب موافقة محدّد السبب.

## 6. MDX والمحتوى (§200)

- لا تنقية معتمدة كحماية عامة — الضابط: مستودع موثوق + مراجعة PR (مُوثّق في requirements/architecture وملتزم به).
- روابط MDX الخارجية تُحوَّل لـ`<a rel="noopener noreferrer">` (تحقق `lib/mdx.tsx` + اختبار وحدة).

## 7. HTTPS (§198)

- إلزامي في الإنتاج — **مسؤولية منصة النشر (E1/المرحلة 6)** لا شيء في الكود؛ HSTS أُرسل الآن كاستعداد (يتجاهله المتصفح على HTTP).

## 8. الفحوصات الأخرى

| الفحص | النتيجة |
|---|---|
| Prettier (§214) | ✅ صفر تنبيهات — مع استثناء `docs/` (لحماية ختم اللوح SHA-256) و`content/` (نص مؤلف يبقى حرفيًّا) وتوثيق السبب في `.prettierignore` |
| `npm run typecheck` / `lint` / `test` / `build` | ✅ كلها خضراء بعد كل تعديل (28/28 اختبارًا) |
| روابط داخلية (§222) | مُتحقَّق منها دخانيًا في كل جولات smoke؛ الفحص الآلي الصارم في اختبارات المرحلة 5 |

## 9. البنود المفتوحة (تنتظر قرار/مرحلة)

1. **تفعيل CSP الإلزامي** — ✅ **مُنفَّذ 2026-10-17** — ترويسة `Content-Security-Policy` (إلزامية) موجودة فعليًّا على `next start` · ترويسة `Content-Security-Policy-Report-Only` محذوفة · اختبار الوحدة `tests/unit/security-headers.test.ts` مُحدَّث ليطالب بالإلزامي ويسقط إن بقيت Report-Only · المبرر: لم تصل أي تقارير مخالفة عبر اختبارات المرحلة 5 (e2e 63/63 · Lighthouse 5 صفحات · axe) والتصفح الفعلي. **تنازل موثّق:** `'unsafe-inline'` محفوظ لأن الصفحات SSG ثابتة والسكربتات التضمّنية (RSC payload + JSON-LD ديناميكي) لا تحمل nonce — التحويل إلى nonce يتطلب تصيير ديناميكي كامل (يُخسِّر CDN caching وSSG ويُوثَّق كأثر أداء).
2. **HSTS شامل النطاقات الفرعية + preload** — عند اعتماد النطاق النهائي (D2/E1).
3. **HTTPS redirect** — إعداد المنصة عند E1.
4. تقييم تحليلات محترمة للخصوصية (§206) — خارج النطاق حتى موافقة صريحة.
5. **ترحيل middleware → proxy** — ✅ **مُنفَّذ 2026-10-17** — `middleware.ts` مُستبدل بـ`proxy.ts` (Next 16 convention) — التصدير `export default function proxy(...)` + `config.matcher` محفوظ · `next build` يعرض «ƒ Proxy (Middleware)» ✅ · كل الاختبارات (typecheck · lint · vitest 47/47 · e2e 63/63 · Lighthouse PASSED) خضراء بعد الترحيل.
6. **og:image** — ✅ **مُنفَّذ 2026-10-17** — `lib/seo.tsx` يُصدر الآن `openGraph.images` + `twitter.images` على كل الصفحات · `ogImageUrl()` يُطلق `/icon.png` (256×256 — ضمن نطاق Open Graph summary card ≥200×200 و≤300×300) · مُتحقَّق فعليًّا في HTML لكل من `/ar` و`/ar/articles/test-mdx-pipeline`.
