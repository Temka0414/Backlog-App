"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  // 🔐 AUTH STATE CHECK
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-slate-950 to-blue-950 text-white relative overflow-hidden">

      {/* LOGIN / LOGOUT BUTTON */}
      <div className="absolute top-6 right-6 z-20 flex gap-2">
            {!user ? (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 text-sm min-w-[90px]"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 transition-all duration-200 text-sm min-w-[90px]"
              >
                Logout
              </button>
            )}
      </div>

      {/* AMBIENT GLOW BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* CENTER PANEL */}
      <div className="relative z-10 text-center space-y-10">

        {/* TITLE */}
        <h1 className="text-6xl font-extrabold tracking-widest bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          MY BACKLOG
        </h1>

        <p className="text-white/60 tracking-wide">
          choose your category
        </p>

        {/* BUTTON PANEL */}
        <div className="flex flex-col items-center gap-4">

          <Link
            href="/category/pirated-aaa"
            className="px-10 py-3 w-72 text-center rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-400 transition hover:scale-105 shadow-lg"
          >
            🏴‍☠ Pirated-AAA Games
          </Link>

          <Link
            href="/category/pirated-indieaa"
            className="px-10 py-3 w-72 text-center rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400 transition hover:scale-105 shadow-lg"
          >
            ⚓︎ Pirated-Indie / AA Games
          </Link>

          <Link
            href="/category/played-legit"
            className="px-10 py-3 w-72 text-center rounded-xl bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-400 transition hover:scale-105 shadow-lg"
          >
            ✔ Played Legit (Not-owned on Steam)
          </Link>

        </div>

      </div>
    </main>
  );
}