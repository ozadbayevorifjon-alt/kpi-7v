import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import { BookOpen, ShieldCheck, Shirt, GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="relative grid min-h-dvh lg:grid-cols-[1.15fr_1fr]">
      {/* Chap panel — brending */}
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-blue-600/20 blur-[130px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-sky-400/10 blur-[110px]"
          aria-hidden
        />
        <div className="relative animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-600/40">
              <GraduationCap className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-400">7-V sinf</p>
              <p className="text-xs text-slate-500">KPI boshqaruv tizimi</p>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
          <h1 className="max-w-xl text-[clamp(2.6rem,4.6vw,4.2rem)] font-black leading-[1.04] tracking-tight text-white">
            Har kun — <span className="text-gradient">yangi yutuq.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">
            Kitob olib kelish, intizom va maktab formasi bo'yicha kunlik baholash, jonli reyting
            va shaxsiy kabinet — barchasi bitta tizimda.
          </p>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {[
              { icon: BookOpen, label: "Kitob", sub: "0–10 ball" },
              { icon: ShieldCheck, label: "Intizom", sub: "0–10 ball" },
              { icon: Shirt, label: "Forma", sub: "0–10 ball" },
            ].map((c, i) => (
              <div
                key={c.label}
                className="glass-card animate-pop p-4 text-center"
                style={{ animationDelay: `${240 + i * 90}ms` }}
              >
                <c.icon className="mx-auto size-6 text-sky-400" />
                <p className="mt-2 text-sm font-bold text-white">{c.label}</p>
                <p className="text-[11px] text-slate-500">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">
          Maksimal kunlik natija — 30 ball. Ma'lumotlaringiz himoyalangan.
        </p>
      </section>

      {/* O'ng panel — forma */}
      <section className="relative flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-600/40">
              <GraduationCap className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-300">7-V sinf</p>
              <p className="text-xs text-slate-500">KPI boshqaruv tizimi</p>
            </div>
          </div>

          <div className="glass-card animate-fade-up p-7 sm:p-9" style={{ animationDelay: "80ms" }}>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">Tizimga kirish</h2>
            <p className="mt-1.5 text-sm text-slate-400">
              Sizga berilgan login va parolni kiriting.
            </p>
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-600">
            Login/parolni sinf rahbari (admin) beradi va o'zgartiradi.
          </p>
        </div>
      </section>
    </main>
  );
}
