"use client";

import { useState, useTransition } from "react";
import { createPost } from "@/app/actions/post";
import { detectPlatform, Platform } from "@/lib/oembed";
import type { FolderWithCount } from "@/components/FolderList";

interface AddPostFormProps {
  folders?: FolderWithCount[];
  defaultFolderId?: string | null;
}

export function AddPostForm({ folders = [], defaultFolderId }: AddPostFormProps) {
  const [url, setUrl] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultFolderId && defaultFolderId !== "uncategorized" ? defaultFolderId : "none"
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const detectedPlatform = detectPlatform(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!url.trim()) {
      setError("Please paste a link first.");
      return;
    }

    const formData = new FormData();
    formData.append("url", url);
    formData.append("folderId", selectedFolderId);

    startTransition(async () => {
      const res = await createPost(formData);
      if (!res.success) {
        setError(res.error || "Failed to save post.");
      } else {
        setSuccess(`Successfully saved "${res.post?.title}"!`);
        setUrl("");
      }
    });
  };

  const getPlatformBadge = (platform: Platform | null) => {
    if (!platform) return null;
    switch (platform) {
      case "youtube":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800/50">
            YouTube
          </span>
        );
      case "twitter":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-400 border border-sky-800/50">
            Twitter / X
          </span>
        );
      case "instagram":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-950/80 text-pink-400 border border-pink-800/50">
            Instagram (Phase 5)
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <label htmlFor="url-input" className="text-sm font-semibold text-slate-200">
          Save a new link
        </label>
        {getPlatformBadge(detectedPlatform)}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            id="url-input"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
              setSuccess(null);
            }}
            placeholder="Paste YouTube or Twitter/X post link..."
            disabled={isPending}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50"
          />
        </div>

        {folders.length > 0 && (
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            disabled={isPending}
            className="px-3 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 cursor-pointer"
          >
            <option value="none">No Folder (Uncategorized)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                📁 {f.name}
              </option>
            ))}
          </select>
        )}

        <button
          type="submit"
          disabled={isPending || !url.trim()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Fetching oEmbed...</span>
            </>
          ) : (
            <span>Save Post</span>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-3 p-3 bg-rose-950/60 border border-rose-800/50 rounded-xl text-xs text-rose-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-800/50 rounded-xl text-xs text-emerald-300">
          {success}
        </div>
      )}
    </div>
  );
}
