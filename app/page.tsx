import Link from "next/link";
import { BookMarked, Code2, Trophy } from "lucide-react";

const sections = [
  {
    title: "八股文",
    description: "高频知识点按面试场景整理，快速建立答题结构。",
    href: "/notes",
    icon: BookMarked,
  },
  {
    title: "算法",
    description: "按题型拆分模板与套路，聚焦前端面试常见算法题。",
    href: "/algorithms",
    icon: Trophy,
  },
  {
    title: "前端手写",
    description: "每道题都是独立做题页，支持编译执行样例。",
    href: "/questions",
    icon: Code2,
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ adminRequired?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Atlas FE 面试复习社区</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        首页保持简约直接：打开就进题库与知识模块，按真实面试流程训练。
      </p>
      {params.adminRequired === "1" ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          管理后台仅对管理员账号开放。游客和普通登录用户不受影响，可继续使用主要功能。
        </p>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-slate-900"
            >
              <Icon className="h-5 w-5 text-slate-900" />
              <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
