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

  const [user, setUser] = useState<any>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // -----------------------------
  // AUTH
  // -----------------------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  // -----------------------------
  // CATEGORY FROM URL
  // -----------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setCategory(cat);
  }, []);

  const categoryLabel =
    CATEGORIES?.[category as keyof typeof CATEGORIES]?.label ?? category;

  // -----------------------------
  // IMAGE SELECT (NO UPLOAD YET)
  // -----------------------------
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview("");
  }

  // -----------------------------
  // CLOUDINARY UPLOAD (ONLY ON SAVE)
  // -----------------------------
  async function uploadToCloudinary(file: File): Promise<string> {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    });

    const formData = new FormData();
    formData.append("file", compressed);
    formData.append("upload_preset", "backlog_unsigned");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dbvfwbmyf/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!data?.secure_url) {
      throw new Error("Upload failed");
    }

    return data.secure_url;
  }

  // -----------------------------
  // SAVE GAME
  // -----------------------------
  async function addGame() {
    if (!name || saving || uploading) return;

    if (!user) {
      alert("You must be logged in to add a game");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = "https://placehold.co/300x400";

      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadToCloudinary(imageFile);
        setUploading(false);
      }

      const { error } = await supabase.from("games").insert([
        {
          name,
          image: imageUrl,
          category,
          user_id: user.id,
        },
      ]);

      if (error) {
        alert(error.message);
        return;
      }

      router.push(`/category/${category}`);
    } catch (err) {
      console.log(err);
      alert("Failed to save game");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  // -----------------------------
  // UI
  // -----------------------------
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

          {/* IMAGE */}
          {!imagePreview ? (
            <label className="block border border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <p className="text-white/60">
                Click to upload image
              </p>
            </label>
          ) : (
            <div className="relative flex justify-center">
              <img
                src={imagePreview}
                className="w-32 aspect-[3/4] object-cover rounded-lg shadow-lg"
              />

              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
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
              disabled={!user || !name || saving || uploading}
              className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition"
            >
              {!user
                ? "Login required"
                : saving
                ? "Saving..."
                : uploading
                ? "Uploading..."
                : "Save"}
            </button>

          </div>

        </div>
      </div>

    </main>
  );
}