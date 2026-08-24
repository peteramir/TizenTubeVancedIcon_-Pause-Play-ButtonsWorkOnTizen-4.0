# ملاحظات التعديلات (TizenTube Standalone - النسخة الهجينة)

بناءً على اتفاقنا: الـ userScript الأساسي (adblock, SponsorBlock, إلخ) بيتاخد من
CDN بتاع Reis زي الأصل (فتستفيد من تحديثاته المستمرة تلقائيًا)، والتعديلات
الشخصية بتاعتك (Play/Pause + Instant Animations) في ملف مستقل بيتحمّل محليًا
**بعد** سكريبت Reis - مش معتمد على كوده الداخلي خالص، فمينفعش يتكسر لو هو غيّر
حاجة في الكود بتاعه.

---

## 🚨 اكتشاف جديد ومهم - سبب محتمل لمشكلة "الـ service مش بيشتغل"

وأنا بختبر التعديلات فعليًا (شغّلت الكود الحقيقي، مش بس قريته)، لقيت حاجة تانية:
`standalone/service/index.js` في آخره سطر:

```js
require('../../dist/service.js');
```

السطر ده **مش شرطي** (مفيش `try/catch`)، وبيحاول يجيب ملف `service.js` (بتاع سيرفر
الـ DIAL - المسؤول عن جعل التطبيق قابل للاكتشاف كـ "Cast target" على الشبكة)
اللي المفروض يتبني من مجلد `service/` في جذر المشروع (منفصل تمامًا عن
`standalone/service/`). لو الملف ده مش موجود في المكان الصح، أي `require()` ليه
بيرمي error فورًا، وبما إنه مش متحوّط بـ try/catch، **الخدمة كلها بتقف فورًا
وقت التشغيل** - يعني السيرفر اللي المفروض يشغل الـ proxy/injector مايبدأش
يشتغل خالص!

**اختبرت ده فعليًا:** شغّلت `standalone/service/dist/index.js` الحقيقي (بعد
عمل build ليه) في بيئة اختبار عندي، وفعلاً وقع فورًا بـ:

```
Error: Cannot find module '../../dist/service.js'
```

لحد ما ضفت خطوة نسخ الملف الصح في المكان الصح - بعدها اشتغل تمام وجاوب على
الـ endpoints بنجاح (اختبرت `/tizentube/patch.js` واستجاب 200 صح).

**ده محتمل يكون هو بالظبط سبب مشكلتك القديمة** ("بيتثبت بس مش بيرضى يشغل
الـ background service") من أول رسالة بعتهالي. مش أقدر أجزم 100% إن ده نفس
السبب اللي واجهته بالظبط (ممكن يكون فيه خطوة تانية غير موثقة في عملية البناء
الرسمية بتاعت Reis مش شايفها أنا)، بس اللقطة اللي عندي من الكود فعلاً بتكسر
بالشكل ده، والإصلاح إتأكد إنه بيحل المشكلة عمليًا.

**الحل:** عدّلت `standalone/service/build-service.js` عشان بعد ما يبني
`service/dist/index.js`، ينسخ ملف `service.js` (اللي هتبنيه من `service/` في
جذر المشروع الأول) لمكانه الصح جوه `standalone/dist/service.js`.

---

## 1) الـ userScript الأساسي - رجع للـ CDN

`standalone/service/index.js` و `injector.js` رجعوا يجيبوا السكريبت الأساسي من:

```
https://cdn.jsdelivr.net/npm/@foxreis/tizentube/dist/userScript.js
```

زي ما كان بالظبط قبل أي تعديل مني. هتستفاد من تحديثات Reis المستمرة (شفت إن
عنده أكتر من 77 إصدار منشور على npm، وآخر واحد نزل من كام يوم بس - يعني نشط
جدًا، مش نسخة متوقفة زي ما كنت فاكر).

## 2) `standalone/service/patch.js` - ملف مستقل جديد

ملف JS بسيط، من غير أي build step، بيتحمّل كـ `<script>` تاني بعد سكريبت Reis
مباشرة، وفيه بس:

**أ) Play/Pause fallback:** بيمسك `keyCode 415` (Play) و `19` (Pause) مباشرة
ويتحكم في الـ `<video>` element (`.play()` / `.pause()`)، احتياطي لو واجهة
يوتيوب الأصلية مش بتستجيب للمفاتيح دي.

**ب) Instant Animations (بtoggle حقيقي):** بما إننا مش بنتحكم في كود Reis
(ومينفعش نضيف حاجة لقائمة إعداداته)، الـ toggle بقى عن طريق **زرار Yellow في
الريموت** (كود 405 - اتأكدت إنه مش مستخدم في أي حاجة تانية في TizenTube؛ Red
بيفتح قائمة التطبيق، Blue بيفتح إعدادات السرعة). دوس عليه مرة يفعّل، تاني يوقف

- وبيفضل محفوظ (`localStorage`) حتى لو قفلت التطبيق وفتحته تاني. هيظهرلك toast
  صغير تحت الشاشة بيقولك الحالة الحالية (ON/OFF).

نفس منطق الـ `0.01ms` بدل الحذف الكامل زي ما اتفقنا (تعتيم الخلفية خلف
الـ Recommendations بيتطبق فورًا بدل ما يتجاهل خالص).

## 3) `standalone/index.html` - تسجيل مفاتيح آمن (لسه موجود)

نفس إصلاح `safeRegisterKey` من قبل - كل `registerKey()` في try/catch منفصل عشان
فشل مفتاح واحد (Play أو Pause على وجه الخصوص) مايوقفش تسجيل باقي المفاتيح.

## 4) الأيقونة

زي ما اتفقنا - Vanced icon بدل TizenTube icon، في مكانين:

- `standalone/icon.png` (1024×1024) و `standalone/icon_16b9.png` (1920×1080،
  الأيقونة في النص على خلفية غامقة متناسقة - الملفين اللي بعتهملي كانوا
  متطابقين 512×512 فعملتلهم resize/padding).
- شاشة اللودينج نفسها (`standalone/index.html`) - ضفت الأيقونة فوق نص
  "TizenTube".

## 5) إصلاح جديد - Play/Pause والـ Instant Animations كانوا مش شغالين

بعد ما ثبّت النسخة اللي فاتت، الـ service والـ injector اشتغلوا تمام والأيقونة
ظهرت صح - لكن الـ toggle بتاع الـ animations معاش ظاهر وزراير Play/Pause لسه مش
شغالة، رغم إنهم شغالين تمام مع TizenBrew,TizenTube.

**السبب اللي لقيته:** رجعت لتاريخ إصدارات TizenBrew نفسه على GitHub، ولقيت
ملاحظة صريحة من reisxd بيقول فيها إن TizenBrew بقى **"يحقن السكريبتات بإضافة
عنصر `<script>` لـ `document.head`"** - يعني مش بيقيّم نص السكريبت مباشرة عن
طريق CDP `Runtime.evaluate` زي ما كان الكود القديم بتاعنا في `injector.js`
بيعمل بالظبط.

الفرق ده مهم: لما تقيّم نص سكريبت كبير كـ "expression" مباشر عن طريق CDP، الكود
بيشتغل جوه execution context ممكن يكون **مختلف** عن الـ "main world" الحقيقي
اللي الصفحة الفعلية شغالة فيه (خصوصًا مع `Runtime.executionContextCreated` اللي
ممكن يطلق لأكتر من context). ده يفسر بالظبط ليه المستمعين بتوعنا لـ
`keydown` (زرار Play/Pause، وزرار Yellow بتاع الـ toggle) ما كانوش بيستقبلوا
أحداث المفاتيح الحقيقية من الريموت، حتى إن السكريبت الأساسي (adblock) كان
شغال عادي.

**الحل:** غيّرت `standalone/service/injector.js` عشان بدل ما يقيّم نص
السكريبتات مباشرة، ينشئ عنصري `<script src="...">` حقيقيين ويضيفهم لـ
`document.head` - بالظبط زي ما TizenBrew بتعمل. كده السكريبتات بتشتغل كسكريبت
عادي 100% على الصفحة، مش كـ "كود متقيّم من DevTools".

ضفت كمان `console.log('[TizenTube patch] loaded, ...')` في بداية `patch.js`
عشان لو المشكلة استمرت، تقدر توصل remote debugger وتتأكد هل الملف بيتحمّل
أصلًا ولا لأ، وتشوف قيم الـ `keyCode` الحقيقية اللي بتوصل من الريموت بتاعك.

⚠️ **صراحة:** معنديش جهاز حقيقي أختبر عليه هل ده حل المشكلة 100% ولا لأ - لكن
الدليل (نفس التغيير اللي TizenBrew نفسها عملته وأثبتت إنه بيحل مشاكل حقن
السكريبتات) قوي جدًا. جرّبها وقولي.

```bash
# 1) سيرفر الـ DIAL (بيتبنى لجذر المشروع dist/service.js)
cd service
npm install
npx rollup -c rollup.config.js

# 2) standalone/service (هيلاقي وينسخ service.js من فوق تلقائيًا،
#    وكمان هينسخ patch.js الجديد بتاعنا)
cd ../standalone/service
npm install
npm install -g @vercel/ncc https://github.com/reisxd/tizen.js/tarball/main
npm run build
```

هتشوف في آخر output بتاع الخطوة التانية سطرين:

```
Copied patch.js -> .../standalone/service/dist/patch.js
Copied .../dist/service.js -> .../standalone/dist/service.js
```

لو ظهر بدل كده تحذير (`WARNING`)، يبقا نسيت الخطوة الأولى - ارجعلها الأول.

**ملحوظة:** مجلد `mods/` بقى **مش مستخدم خالص** في النسخة دي (مفيش داعي تعمله
build) - سايبه في المشروع بس كمرجع لو حبيت تشوف كود Reis نفسه.

## إزاي تعمل الـ .wgt

من نفس مجلد `standalone/` (بعد ما تخلص الخطوتين فوق):

```bash
cd standalone
mkdir release
tizenjs build . -t wgt -o release/TizenTube.wgt --author F:\PETER\TizenBrew\Tizen_Certificate\myprofile9\author.p12 --authorPwd Aa111111 -p public --ignore node_modules,/.*\.wgt$/,/userwidget/,/release/
```

- `tizenjs` أداة مجتمعية (مش Tizen Studio الرسمية) من نفس مطور TizenTube:
  `https://github.com/reisxd/tizen.js` - ثبّتها زي ما ظهر في الأمر بتاع الخطوة
  التانية فوق.
- `your-cert.p12` لازم يكون **شهادتك الشخصية انت** (اعملها من Tizen Studio →
  Certificate Manager، مجانية) - مش شهادة reisxd (دي سرّية وخاصة بيه في الـ CI
  بتاعه).
- بعد ما يخلص، تقدر تتأكد إن كل حاجة اتحزمت صح بفك ضغط ملف الـ `.wgt` نفسه (هو
  أساسًا ملف zip):
  ```bash
  unzip -l release/TizenTube.wgt | grep -E "service/dist|dist/service|icon"
  ```
  المفروض تشوف `service/dist/index.js`، `service/dist/patch.js`،
  `dist/service.js`، و `icon.png`/`icon_16b9.png` كلهم موجودين.

---

## هل تحتاج تمسح TizenTube Standalone الأصلي؟

نفس الإجابة من قبل: **الأسهل إنك تمسحه الأول**، لأن نسختك هتتوقّع بشهادتك
الشخصية (مختلفة عن شهادة reisxd السرية)، فتثبيت بنفس معرف التطبيق غالبًا هيوقف
برفض بسبب عدم تطابق التوقيع. لو عايز الاتنين جنب بعض، غيّر `id`/`package` في
`standalone/config.xml` لمعرف مبني على شهادتك الشخصية.
