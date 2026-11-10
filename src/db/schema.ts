import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export type Role = "admin" | "operator" | "student";
export type KpiCategory = "book" | "discipline" | "uniform";

export const KPI_CATEGORIES: KpiCategory[] = ["book", "discipline", "uniform"];

export const students = pgTable(
  "students",
  {
    id: serial("id").primaryKey(),
    fullName: text("full_name").notNull(),
    className: text("class_name").notNull().default("7-V"),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("students_name_idx").on(t.fullName)],
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").$type<Role>().notNull(),
    category: text("category").$type<KpiCategory>(),
    studentId: integer("student_id").references(() => students.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("users_username_unique").on(t.username)],
);

export const scores = pgTable(
  "scores",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD (Asia/Tashkent)
    category: text("category").$type<KpiCategory>().notNull(),
    score: integer("score").notNull(),
    gradedBy: integer("graded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("scores_student_date_category_unique").on(
      t.studentId,
      t.date,
      t.category,
    ),
    index("scores_date_idx").on(t.date),
  ],
);

export const scheduleEntries = pgTable(
  "schedule_entries",
  {
    id: serial("id").primaryKey(),
    dayOfWeek: integer("day_of_week").notNull(), // 1 = Dushanba ... 7 = Yakshanba
    dateLabel: text("date_label").notNull(), // "16-noyabr"
    subject: text("subject").notNull(),
    teacher: text("teacher").notNull(),
    startTime: text("start_time").notNull(), // "08:00"
    endTime: text("end_time").notNull(), // "08:45"
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("schedule_day_idx").on(t.dayOfWeek)],
);

export type Student = typeof students.$inferSelect;
export type User = typeof users.$inferSelect;
export type Score = typeof scores.$inferSelect;
export type ScheduleEntry = typeof scheduleEntries.$inferSelect;
