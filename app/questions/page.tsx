import Link from "next/link";

import { handwriteChallenges } from "@/lib/content";

export default function QuestionsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">前端手写题库</h1>
      <p className="mt-2 text-sm text-slate-600">每道题都是独立做题界面，包含题面、代码区、测试运行与提交区。</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {handwriteChallenges.map((item) => (
          <Link
            key={item.slug}
            href={`/questions/${item.slug}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-900"
          >
            <p className="text-sm text-slate-500">{item.category}</p>
            <h2 className="mt-2 text-xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm text-slate-600">
              {item.level} · {item.duration} · {item.solvedCount}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
