"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-slate-950 to-blue-950 text-white relative overflow-hidden">

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