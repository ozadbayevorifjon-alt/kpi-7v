import "dotenv/config";
import { db } from "@/db";
import { scores, scheduleEntries, students, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { todayUZ } from "@/lib/dates";
import { sql } from "drizzle-orm";

const STUDENTS: { name: string; username: string }[] = [
  { name: "Aziza Karimova", username: "aziza.k" },
  { name: "Bekzod Rahimov", username: "bekzod.r" },
  { name: "Dilnoza Yusupova", username: "dilnoza.y" },
  { name: "Jasur Toshpo'latov", username: "jasur.t" },
  { name: "Malika Sobirova", username: "malika.s" },
  { name: "Otabek Ergashev", username: "otabek.e" },
  { name: "Nilufar Qodirova", username: "nilufar.q" },
  { name: "Sardor Nazarov", username: "sardor.n" },
  { name: "Madina Axmedova", username: "madina.a" },
  { name: "Diyor Komilov", username: "diyor.k" },
  { name: "Zarnigor Mirzayeva", username: "zarnigor.m" },
  { name: "Kamron Usmonov", username: "kamron.u" },
];

const SCHEDULE: {
  day: number;
  date: string;
  subject: string;
  teacher: string;
  start: string;
  end: string;
}[] = [
  // Dushanba, 16-noyabr
  { day: 1, date: "16-noyabr", subject: "Matematika", teacher: "Dilafruz Axmedova", start: "08:00", end: "08:45" },
  { day: 1, date: "16-noyabr", subject: "Matematika", teacher: "Dilafruz Axmedova", start: "08:55", end: "09:40" },
  { day: 1, date: "16-noyabr", subject: "Ingliz tili", teacher: "Malika Yusupova", start: "09:50", end: "10:35" },
  { day: 1, date: "16-noyabr", subject: "Ona tili", teacher: "Gulnoza Rahimova", start: "10:45", end: "11:30" },
  { day: 1, date: "16-noyabr", subject: "Tarix", teacher: "Jasur Karimov", start: "11:40", end: "12:25" },
  // Seshanba, 17-noyabr
  { day: 2, date: "17-noyabr", subject: "Fizika", teacher: "Otabek Nazarov", start: "08:00", end: "08:45" },
  { day: 2, date: "17-noyabr", subject: "Ingliz tili", teacher: "Malika Yusupova", start: "08:55", end: "09:40" },
  { day: 2, date: "17-noyabr", subject: "Matematika", teacher: "Dilafruz Axmedova", start: "09:50", end: "10:35" },
  { day: 2, date: "17-noyabr", subject: "Adabiyot", teacher: "Gulnoza Rahimova", start: "10:45", end: "11:30" },
  { day: 2, date: "17-noyabr", subject: "Jismoniy tarbiya", teacher: "Sardor Toshpo'latov", start: "11:40", end: "12:25" },
  // Chorshanba, 18-noyabr
  { day: 3, date: "18-noyabr", subject: "Ona tili", teacher: "Gulnoza Rahimova", start: "08:00", end: "08:45" },
  { day: 3, date: "18-noyabr", subject: "Matematika", teacher: "Dilafruz Axmedova", start: "08:55", end: "09:40" },
  { day: 3, date: "18-noyabr", subject: "Biologiya", teacher: "Nilufar Sobirova", start: "09:50", end: "10:35" },
  { day: 3, date: "18-noyabr", subject: "Ingliz tili", teacher: "Malika Yusupova", start: "10:45", end: "11:30" },
  { day: 3, date: "18-noyabr", subject: "Informatika", teacher: "Bekzod Ergashev", start: "11:40", end: "12:25" },
  // Payshanba, 19-noyabr
  { day: 4, date: "19-noyabr", subject: "Matematika", teacher: "Dilafruz Axmedova", start: "08:00", end: "08:45" },
  { day: 4, date: "19-noyabr", subject: "Rus tili", teacher: "Olga Petrova", start: "08:55", end: "09:40" },
  { day: 4, date: "19-noyabr", subject: "Tarix", teacher: "Jasur Karimov", start: "09:50", end: "10:35" },
  { day: 4, date: "19-noyabr", subject: "Fizika", teacher: "Otabek Nazarov", start: "10:45", end: "11:30" },
  { day: 4, date: "19-noyabr", subject: "Texnologiya", teacher: "Sardor Toshpo'latov", start: "11:40", end: "12:25" },
  // Juma, 20-noyabr
  { day: 5, date: "20-noyabr", subject: "Adabiyot", teacher: "Gulnoza Rahimova", start: "08:00", end: "08:45" },
  { day: 5, date: "20-noyabr", subject: "Ingliz tili", teacher: "Malika Yusupova", start: "08:55", end: "09:40" },
  { day: 5, date: "20-noyabr", subject: "Matematika", teacher: "Dilafruz Axmedova", start: "09:50", end: "10:35" },
  { day: 5, date: "20-noyabr", subject: "Geografiya", teacher: "Nilufar Sobirova", start: "10:45", end: "11:30" },
  { day: 5, date: "20-noyabr", subject: "Jismoniy tarbiya", teacher: "Sardor Toshpo'latov", start: "11:40", end: "12:25" },
  // Shanba, 21-noyabr
  { day: 6, date: "21-noyabr", subject: "Ona tili", teacher: "Gulnoza Rahimova", start: "08:00", end: "08:45" },
  { day: 6, date: "21-noyabr", subject: "Rus tili", teacher: "Olga Petrova", start: "08:55", end: "09:40" },
  { day: 6, date: "21-noyabr", subject: "Informatika", teacher: "Bekzod Ergashev", start: "09:50", end: "10:35" },
  { day: 6, date: "21-noyabr", subject: "Kimyo", teacher: "Dilobar Qodirova", start: "10:45", end: "11:30" },
  // Yakshanba, 22-noyabr
  { day: 7, date: "22-noyabr", subject: "Sinf soati", teacher: "Dilafruz Axmedova", start: "09:00", end: "09:45" },
];

function main() {
  return (async () => {
    const existing = await db.select({ id: users.id }).from(users).limit(1);
    if (existing.length) {
      console.log("⚠️  Bazada foydalanuvchilar mavjud — seed o'tkazib yuborildi.");
      return;
    }

    console.log("🌱 Seed boshlandi...");

    // Admin
    await db.insert(users).values({
      username: "admin",
      passwordHash: hashPassword("admin123"),
      role: "admin",
    });

    // Operatorlar
    const operators = [
      { username: "kitob_op", category: "book" as const },
      { username: "intizom_op", category: "discipline" as const },
      { username: "forma_op", category: "uniform" as const },
    ];
    for (const op of operators) {
      await db.insert(users).values({
        username: op.username,
        passwordHash: hashPassword("operator123"),
        role: "operator",
        category: op.category,
      });
    }

    // O'quvchilar + akkauntlari
    const studentPassword = hashPassword("student123");
    const [operatorRows] = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`${users.role} = 'operator'`)
      .limit(1);
    const graderId = operatorRows?.id ?? null;

    const insertedIds: number[] = [];
    for (const s of STUDENTS) {
      const [st] = await db
        .insert(students)
        .values({ fullName: s.name, className: "7-V" })
        .returning();
      insertedIds.push(st.id);
      await db.insert(users).values({
        username: s.username,
        passwordHash: studentPassword,
        role: "student",
        studentId: st.id,
      });
    }

    // Dars jadvali
    await db.insert(scheduleEntries).values(
      SCHEDULE.map((e, i) => ({
        dayOfWeek: e.day,
        dateLabel: e.date,
        subject: e.subject,
        teacher: e.teacher,
        startTime: e.start,
        endTime: e.end,
        sortOrder: i % 6,
      })),
    );

    // So'nggi 14 kunlik namuna baholar (deterministik)
    const rows: (typeof scores.$inferInsert)[] = [];
    for (let si = 0; si < insertedIds.length; si++) {
      const skill = 5 + (si % 6); // 5..10 oralig'ida bazaviy daraja
      for (let back = 13; back >= 0; back--) {
        const date = todayUZ(-back);
        for (let ci = 0; ci < 3; ci++) {
          const category = (["book", "discipline", "uniform"] as const)[ci];
          const wobble = ((si * 7 + back * 5 + ci * 3) % 5) - 2; // -2..2
          const score = Math.max(2, Math.min(10, skill + wobble));
          rows.push({ studentId: insertedIds[si], date, category, score, gradedBy: graderId });
        }
      }
    }
    await db.insert(scores).values(rows);

    console.log(`✅ Tayyor: ${STUDENTS.length} o'quvchi, 3 operator, admin, jadval, ${rows.length} baho.`);
    process.exit(0);
  })();
}

main().catch((e) => {
  console.error("❌ Seed xatosi:", e);
  process.exit(1);
});
