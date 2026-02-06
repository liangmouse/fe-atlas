import { redirect } from "next/navigation";

import { isAdminUser } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold">管理员入口</h1>
        <p className="mt-3 text-slate-600">
          当前未配置 Supabase 环境变量。请先配置
          <code className="mx-1 rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>
          和
          <code className="mx-1 rounded bg-slate-100 px-1">
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
          </code>
          （或
          <code className="mx-1 rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          ）。
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  if (!isAdminUser(user)) {
    redirect("/?adminRequired=1");
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">管理员控制台（占位）</h1>
      <p className="mt-3 text-slate-600">
        已登录账号：{user.email ?? user.id}
      </p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-700">后续在这里接入题目管理、内容审核与用户管理。</p>
      </div>
    </main>
  );
}
