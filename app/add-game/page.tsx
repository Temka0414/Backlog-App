"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import imageCompression from "browser-image-compression";

export default function AddGame() {
  const router = useRouter();

  const [category, setCategory] = useState("pirated-indieaa");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setCategory(cat);
  }, []);

  const categoryLabel =
    CATEGORIES?.[category as keyof typeof CATEGORIES]?.label ?? category;

  async function addGame() {
  if (!name || uploading || saving) return;

  setSaving(true);

  const { data: userData } = await supabase.auth.getUser();

  const { error } = await supabase.from("games").insert([
    {
      name,
      image: image || "https://placehold.co/300x400",
      category,
      user_id: userData.user?.id,
    },
  ]);

  setSaving(false);

  if (!error) {
    router.push(`/category/${category}`);
  } else {
    alert(error.message);
  }
}


async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);

  try {
    // 1. compress image first
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.8,          // max 800KB
      maxWidthOrHeight: 1200,  // resize large images
      useWebWorker: true,
    });

    // 2. upload compressed file
    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("upload_preset", "backlog_unsigned");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dbvfwbmyf/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (data?.secure_url) {
      setImage(data.secure_url);
    } else {
      alert("Upload failed");
    }
  } catch (err) {
    console.log(err);
    alert("Compression/upload failed");
  }

  setUploading(false);
}

function removeImage() {
  setImage("");
  setUploading(false);
}

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-blue-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-wide">
            Add Game
          </h1>

          <p className="text-white/60 text-sm px-3 py-1 bg-white/5 border border-white/10 rounded-full inline-block">
            {categoryLabel}
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">

          {/* NAME */}
          <input
            placeholder="Game name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-blue-400 outline-none"
          />

          {/* UPLOAD / PREVIEW */}
          {!image ? (
            <label className="block border border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition">
              <input type="file" onChange={handleUpload} className="hidden" />

              {uploading ? (
                <p className="text-blue-300">Uploading...</p>
              ) : (
                <p className="text-white/60">Click to upload image</p>
              )}
            </label>
          ) : (
            <div className="relative flex justify-center">
              <img
                src={image}
                className="w-32 aspect-[3/4] object-cover rounded-lg shadow-lg"
              />

              {/* REMOVE BUTTON */}
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex gap-2 pt-2">

            <Link
              href={`/category/${category}`}
              className="flex-1 text-center px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              Back
            </Link>

            <button
              onClick={addGame}
              disabled={!name || uploading || saving}
              className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition"
            >
              {saving ? "Saving..." : "Save"}
            </button>

          </div>

        </div>
      </div>
    </main>
  );
}