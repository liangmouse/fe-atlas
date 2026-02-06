"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, LogIn, LogOut, Shield } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

type SimpleUser = {
  id: string;
  email?: string;
};

export function HiddenAuthEntry() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? undefined });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? { id: session.user.id, email: session.user.email ?? undefined }
          : null,
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    const next = `${window.location.pathname}${window.location.search}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
  };

  return (
    <div className="fixed right-4 top-4 z-50">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title="管理员入口"
        className="rounded-full border border-slate-300 bg-white/70 p-2 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-slate-900"
      >
        <Shield className="h-4 w-4" />
      </button>

      {open ? (
        <div className="mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {user ? (
            <>
              <p className="px-2 py-1 text-xs text-slate-500">{user.email ?? "已登录"}</p>
              <Link
                href="/admin"
                className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                <Lock className="h-4 w-4" />
                管理员控制台
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={!isSupabaseConfigured}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              使用 Google 登录
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
