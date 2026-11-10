# 7-V Sinf KPI — Kunlik Baholash va Reyting Tizimi

7-V sinf o'quvchilari uchun to'liq fullstack veb-ilova: kunlik KPI baholash (kitob, intizom, forma),
jonli reyting, o'quvchi kabinetlari va dars jadvali boshqaruvi.

## Imkoniyatlar

| Rol | Imkoniyatlar |
|---|---|
| **Admin** | O'quvchi qo'shish/tahrirlash/o'chirish, login-parol yaratish va yangilash, barcha yo'nalishlarni baholash (0–10), kunlik va umumiy reyting, dars jadvalini boshqarish |
| **Operator** | Faqat o'z yo'nalishi: `kitob_op` → Kitob, `intizom_op` → Intizom, `forma_op` → Forma. Boshqa yo'nalishlarga server tomonda ruxsat yo'q |
| **O'quvchi** | Faqat o'z ma'lumotlari: bugungi baholar (3 yo'nalish, jami /30), reytingdagi o'rni, oldingi kunlar tarixi va grafik, dars jadvali |

## Texnologiyalar

- **Next.js 16** (App Router, Server Components, Server Actions)
- **PostgreSQL** + **Drizzle ORM**
- **Tailwind CSS 4**
- Sessiya: imzali httpOnly cookie (HMAC-SHA256), parollar: `scrypt` xesh
- Xavfsizlik: barcha ruxsatlar server tomonda tekshiriladi — frontend yashirish suiiste'molga qarshi hisoblanmaydi

## Demo akkauntlar (seed'dan keyin)

| Rol | Login | Parol |
|---|---|---|
| Admin | `admin` | `admin123` |
| Kitob operatori | `kitob_op` | `operator123` |
| Intizom operatori | `intizom_op` | `operator123` |
| Forma operatori | `forma_op` | `operator123` |
| O'quvchilar (12 ta) | `aziza.k`, `bekzod.r`, `dilnoza.y`, `jasur.t`, `malika.s`, `otabek.e`, `nilufar.q`, `sardor.n`, `madina.a`, `diyor.k`, `zarnigor.m`, `kamron.u` | `student123` |

> Ishga tushirgandan keyin parollarni admin panel orqali almashtiring.

---

## 1. VS Code orqali ishga tushirish

### Talablar
- Node.js 18.18+ (tavsiya: 20/22)
- PostgreSQL 14+ (lokal yoki Docker)

### Qadamlar

1. **Arxivni oching va VS Code'da kiring:**
   ```bash
   unzip kpi-7v-sayt.zip && cd kpi-7v-sayt
   code .
   ```

2. **PostgreSQL bazani yarating** (agar Docker bo'lsa):
   ```bash
   docker run --name kpi-pg -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=app_db -p 5432:5432 -d postgres:16
   ```
   Lokal PostgreSQL bo'lsa:
   ```bash
   createdb app_db
   ```

3. **`.env` faylini sozlang:**
   ```env
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
   APP_SECRET=uzun-tasodifiy-maxfiy-kalit-kamida-32-belgi
   ```

4. **Paketlarni o'rnating:**
   ```bash
   npm install
   ```

5. **Jadvallarni yarating va demo ma'lumotlarni yuklang:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

6. **Ishga tushiring:**
   ```bash
   npm run dev
   ```
   Brauzerda oching: http://localhost:3000

7. **Production rejim:**
   ```bash
   npm run build
   npm run start
   ```

---

## 2. Hostingga joylash

### Vercel (tavsiya etiladi)
1. Loyihani GitHub'ga yuklang (`git init`, `git add .`, `git commit`, `git push`).
2. [vercel.com](https://vercel.com) → **Add New Project** → repo'ni tanlang.
3. **Environment Variables** qo'ying:
   - `DATABASE_URL` — PostgreSQL ulanish satri (masalan, [Neon](https://neon.tech) bepul bazasi)
   - `APP_SECRET` — tasodifiy 32+ belgili kalit
4. **Deploy** tugmasini bosing.
5. Deploydan keyin bir marta bazani tayyorlang:
   ```bash
   DATABASE_URL="sizning-prod-url" npx drizzle-kit push
   DATABASE_URL="sizning-prod-url" npm run db:seed
   ```

### Netlify
1. GitHub'ga yuklang.
2. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project** → repo'ni tanlang.
3. Build sozlamalari (Netlify Next.js avtomatik aniqlaydi):
   - Build command: `npm run build`
   - Publish: `.next`
   - `@netlify/plugin-nextjs` plagini avtomatik yoqiladi.
4. **Site settings → Environment variables**:
   - `DATABASE_URL` — masofaviy PostgreSQL (Neon/Supabase/Railway) — Netlify serverless lokal `127.0.0.1` bazaga kira olmaydi!
   - `APP_SECRET` — tasodifiy 32+ belgili kalit
5. **Deploy**. So'ng bir marta `drizzle-kit push` va `db:seed` ni prod `DATABASE_URL` bilan ishga tushiring.

### VPS (Ubuntu)
```bash
git clone <repo> && cd kpi-7v-sayt
npm install
npm run build
DATABASE_URL=... APP_SECRET=... npx drizzle-kit push
DATABASE_URL=... APP_SECRET=... npm run db:seed
pm2 start "npm run start" --name kpi-7v   # yoki systemd unit
```

---

## Loyiha tuzilishi

```
src/
├── app/
│   ├── login/             # Kirish sahifasi
│   ├── dashboard/         # Rol bo'yicha dashboard (server)
│   ├── api/health/        # Sog'liq tekshiruvi
│   └── page.tsx           # Yo'naltirish
├── components/
│   ├── admin/             # Admin: baholash, reyting, o'quvchilar, jadval
│   ├── OperatorDashboard.tsx
│   └── StudentDashboard.tsx
├── db/
│   ├── schema.ts          # users, students, scores, schedule_entries
│   ├── index.ts           # PostgreSQL ulanishi
│   └── seed.ts            # Demo ma'lumotlar (npm run db:seed)
└── lib/
    ├── auth.ts            # Sessiya (imzali cookie) + rol tekshiruvi
    ├── password.ts        # scrypt parol xeshlash
    ├── actions.ts         # Server Actions (barcha mutatsiyalar, server-auth)
    ├── data.ts            # Server so'rovlar (reyting, tarix, jadval)
    ├── types.ts           # Umumiy tiplar/constantalar
    └── dates.ts           # Toshkent vaqti bilan sana yordamchilari
```

## Xavfsizlik eslatmalari

- Parollar **scrypt + salt** bilan saqlanadi (ochiq matnda hech qaerda yo'q).
- Sessiya cookie si `httpOnly`, HMAC-SHA256 bilan imzolangan, `APP_SECRET` bilan.
- O'quvchi faqat o'z sessiyasidagi `studentId` orqali ma'lumot oladi — URL orqali turmak client id berilmaydi.
- Operator faqat o'z kategoriyasiga yozadi — bu server action ichida majburiy tekshiriladi.
- Production'da `APP_SECRET` ni albatta almashtiring.
