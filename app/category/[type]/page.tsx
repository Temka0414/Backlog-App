"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

type Game = {
  id: string;
  name: string;
  image: string;
  status?: string | null;
  category: string;
  created_at?: string;
};

export default function CategoryPage() {
  const params = useParams();
  const category = params.type as string;

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"az" | "recent">(() => {
      if (typeof window === "undefined") return "az";
      const saved = localStorage.getItem("sort");
      return saved === "recent" ? "recent" : "az";
    });

  // LOAD SORT
  useEffect(() => {
  const saved = localStorage.getItem("sort");

  if (saved === "az" || saved === "recent") {
    setSort(saved);
  } else {
    setSort("az");
  }
}, []);

  // SAVE SORT
  useEffect(() => {
    localStorage.setItem("sort", sort);
  }, [sort]);

  // FETCH
  async function fetchGames() {
    setLoading(true);

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("category", category);

    if (error) {
      console.log("FETCH ERROR:", error);
      setLoading(false);
      return;
    }

    let sorted = data || [];

    if (sort === "az") {
      sorted = [...sorted].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted = [...sorted].sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
      );
    }

    setGames(sorted);
    setLoading(false);
  }

  // STATUS UPDATE (optimistic UI)
  async function setStatus(id: string, status: string | null) {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status } : g))
    );

    const { error } = await supabase
      .from("games")
      .update({ status })
      .eq("id", id);

    if (error) console.log("STATUS ERROR:", error);
  }

  useEffect(() => {
    if (category) fetchGames();
  }, [category, sort]);

  return (
    <main className="p-6 min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-blue-950 text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 gap-4">

        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
        >
          ← Back
        </Link>

        <div className="text-center flex-1">
          <h1 className="text-4xl font-extrabold tracking-widest text-white/90">
            {CATEGORIES[category as keyof typeof CATEGORIES]?.label ?? category}
          </h1>
        </div>

        <Link
          href={`/add-game?category=${category}`}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
        >
          + Add
        </Link>

      </div>

      {/* SORT */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSort("recent")}
          className={`px-3 py-1 rounded-lg border transition
            ${
              sort === "recent"
                ? "bg-white/10 border-white/30"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
        >
          Recent
        </button>

        <button
          onClick={() => setSort("az")}
          className={`px-3 py-1 rounded-lg border transition
            ${
              sort === "az"
                ? "bg-white/10 border-white/30"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
        >
          A → Z
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">

        {/* SKELETON */}
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-lg bg-white/5 animate-pulse"
            />
          ))}

        {!loading &&
          games.map((g) => (
            <div
              key={g.id}
              className="relative group rounded-lg overflow-hidden z-10 shadow-md transition-all duration-500 ease-out
              hover:shadow-[0_25px_70px_rgba(0,0,0,0.6)]
              hover:-translate-y-[3px]"
            >

              {/* DELETE */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();

                  const { error } = await supabase
                    .from("games")
                    .delete()
                    .eq("id", g.id);

                  if (error) {
                    console.log("DELETE ERROR:", error);
                    return;
                  }

                  fetchGames();
                }}
                className="absolute top-2 right-2 z-20 bg-black/70 text-white w-7 h-7 rounded-full
                           opacity-0 group-hover:opacity-100 transition
                           flex items-center justify-center hover:bg-red-500"
              >
                ✕
              </button>

              {/* IMAGE */}
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                <img
                  src={g.image}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
                />
              </div>

              {/* STATUS (ONLY ON HOVER) */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition z-20">
              {g.status === "completed" && (
                <div className="bg-green-500/90 text-white text-xs px-2 py-1 rounded shadow-lg backdrop-blur-sm">
                  ✔ 100%
                </div>
              )}

              {g.status === "beaten" && (
                <div className="bg-yellow-400/90 text-black text-xs px-2 py-1 rounded shadow-lg backdrop-blur-sm">
                  🏆 Beaten
                </div>
              )}
            </div>

              {/* HOVER OVERLAY */}
              <div className="absolute inset-0 flex items-center justify-center 
                              gap-6 opacity-0 group-hover:opacity-100     
                              transition bg-black/20">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatus(g.id, "completed");
                  }}
                  className="text-4xl text-white/70 hover:text-green-400 hover:scale-125 transition"
                >
                  ✔
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatus(g.id, "beaten");
                  }}
                  className="text-4xl text-white/70 hover:text-yellow-400 hover:scale-125 transition"
                >
                  🏆
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatus(g.id, null);
                  }}
                  className="text-2xl text-white/50 hover:text-white transition"
                >
                  ✕
                </button>

              </div>

              {/* NAME */}
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-3 opacity-0 group-hover:opacity-100 transition">
                <p className="text-sm font-semibold">{g.name}</p>
              </div>

            </div>
          ))}

      </div>
    </main>
  );
}