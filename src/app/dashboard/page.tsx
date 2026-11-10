import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { isValidDateString, todayUZ } from "@/lib/dates";
import {
  getOperators,
  getRanking,
  getSchedule,
  getScoresByDate,
  getStatsOverview,
  getStudentById,
  getStudentHistory,
  getStudentsWithUsernames,
  type DayScore,
} from "@/lib/data";
import TopBar from "@/components/TopBar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import OperatorDashboard from "@/components/OperatorDashboard";
import StudentDashboard from "@/components/StudentDashboard";

export const dynamic = "force-dynamic";

const emptyDay: DayScore = { book: null, discipline: null, uniform: null };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const today = todayUZ();
  const tab = typeof sp.tab === "string" ? sp.tab : "baholash";
  const date =
    typeof sp.date === "string" && isValidDateString(sp.date) && sp.date <= today
      ? sp.date
      : today;

  /* ---------- ADMIN ---------- */
  if (user.role === "admin") {
    const [students, ranking, dayScores, schedule, stats, operators] = await Promise.all([
      getStudentsWithUsernames(),
      getRanking(date),
      getScoresByDate(date),
      getSchedule(),
      getStatsOverview(),
      getOperators(),
    ]);
    return (
      <>
        <TopBar user={user} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <AdminDashboard
            tab={tab}
            date={date}
            today={today}
            students={students}
            ranking={ranking}
            dateScores={Object.fromEntries(dayScores)}
            schedule={schedule}
            stats={stats}
            operators={operators}
          />
        </main>
      </>
    );
  }

  /* ---------- OPERATOR ---------- */
  if (user.role === "operator") {
    if (!user.category) {
      return (
        <>
          <TopBar user={user} />
          <main className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-400">
            Akkauntga yo'nalish biriktirilmagan. Adminga murojaat qiling.
          </main>
        </>
      );
    }
    const [students, dayScores] = await Promise.all([
      getStudentsWithUsernames(),
      getScoresByDate(date),
    ]);
    return (
      <>
        <TopBar user={user} />
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          <OperatorDashboard
            category={user.category}
            students={students}
            dateScores={Object.fromEntries(dayScores)}
            date={date}
            today={today}
          />
        </main>
      </>
    );
  }

  /* ---------- O'QUVCHI (faqat o'z ma'lumotlari) ---------- */
  if (!user.studentId) redirect("/login");
  const [student, dayScores, history, ranking, schedule] = await Promise.all([
    getStudentById(user.studentId),
    getScoresByDate(today),
    getStudentHistory(user.studentId, 14),
    getRanking(today),
    getSchedule(),
  ]);
  if (!student) redirect("/login");

  const me = ranking.find((r) => r.studentId === student.id);
  return (
    <>
      <TopBar user={user} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <StudentDashboard
          student={student}
          todayScores={dayScores.get(student.id) ?? emptyDay}
          rank={me?.rank ?? 0}
          totalStudents={ranking.length}
          overallTotal={me?.overallTotal ?? 0}
          history={history}
          schedule={schedule}
        />
      </main>
    </>
  );
}
