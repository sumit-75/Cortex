"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Post } from "@prisma/client";
import { deletePost, movePostToFolder } from "@/app/actions/post";
import type { FolderWithCount } from "@/components/FolderList";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load?: (element?: HTMLElement | null) => void;
      };
    };
  }
}

interface PostCardProps {
  post: Post;
  folders?: FolderWithCount[];
}

export function PostCard({ post, folders = [] }: PostCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger Twitter widget hydration when Twitter embed mounts
  useEffect(() => {
    if (post.platform === "twitter" && containerRef.current) {
      if (window.twttr?.widgets?.load) {
        window.twttr.widgets.load(containerRef.current);
      }
    }
  }, [post.platform, post.embedHtml]);

  const handleDelete = () => {
    startTransition(async () => {
      await deletePost(post.id);
    });
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const targetFolderId = value === "none" ? null : value;
    startTransition(async () => {
      await movePostToFolder(post.id, targetFolderId);
    });
  };

  const renderPlatformBadge = () => {
    switch (post.platform) {
      case "youtube":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-950/90 text-red-400 border border-red-800/40">
            YouTube
          </span>
        );
      case "twitter":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-950/90 text-sky-400 border border-sky-800/40">
            Twitter / X
          </span>
        );
      case "instagram":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-pink-950/90 text-pink-400 border border-pink-800/40">
            Instagram
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-md transition-all hover:border-slate-700/80 ${
        isPending ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {/* Top Card Header */}
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {renderPlatformBadge()}
          <h3 className="text-xs font-semibold text-slate-200 truncate" title={post.title}>
            {post.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open original post"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {showConfirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-2 py-1 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors"
              >
                {isPending ? "..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-2 py-1 text-[10px] font-medium text-slate-400 hover:text-white bg-slate-800 rounded-md"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              title="Delete post"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Embed Media Content */}
      <div className="p-4 flex-1 flex items-center justify-center bg-slate-950/40">
        {post.platform === "youtube" ? (
          <div
            className="w-full aspect-video rounded-xl overflow-hidden shadow-inner bg-black flex items-center justify-center"
            dangerouslySetInnerHTML={{
              __html: post.embedHtml.replace(
                /<iframe /g,
                '<iframe class="w-full h-full border-0" '
              ),
            }}
          />
        ) : (
          <div
            className="w-full overflow-x-auto flex justify-center text-slate-200 text-sm py-1 [&_blockquote]:max-w-full [&_iframe]:mx-auto"
            dangerouslySetInnerHTML={{ __html: post.embedHtml }}
          />
        )}
      </div>

      {/* Card Footer Metadata & Folder Movement Dropdown */}
      <div className="px-4 py-2.5 border-t border-slate-800/60 bg-slate-900/80 flex items-center justify-between gap-2 text-[11px] text-slate-400">
        <select
          value={post.folderId || "none"}
          onChange={handleFolderChange}
          disabled={isPending}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[150px] truncate"
        >
          <option value="none">📁 Uncategorized</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              📁 {f.name}
            </option>
          ))}
        </select>

        <span className="shrink-0">{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
