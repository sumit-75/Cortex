"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createFolder, deleteFolder } from "@/app/actions/folder";

export type FolderWithCount = {
  id: string;
  name: string;
  _count: {
    posts: number;
  };
};

interface FolderListProps {
  folders: FolderWithCount[];
  totalPostsCount: number;
  uncategorizedCount: number;
}

export function FolderList({
  folders,
  totalPostsCount,
  uncategorizedCount,
}: FolderListProps) {
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folderId");

  const [newFolderName, setNewFolderName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newFolderName.trim()) return;

    const formData = new FormData();
    formData.append("name", newFolderName.trim());

    startTransition(async () => {
      const res = await createFolder(formData);
      if (!res.success) {
        setError(res.error || "Failed to create folder");
      } else {
        setNewFolderName("");
        setShowAddForm(false);
      }
    });
  };

  const handleDeleteFolder = (folderId: string) => {
    startTransition(async () => {
      const res = await deleteFolder(folderId);
      if (res.success) {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Folders & Categories
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          {showAddForm ? "Cancel" : "+ New"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateFolder} className="space-y-2 px-1">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name (e.g. Tech)..."
            autoFocus
            disabled={isPending}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isPending || !newFolderName.trim()}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            {isPending ? "Creating..." : "Save Folder"}
          </button>
          {error && <p className="text-[10px] text-rose-400 px-1">{error}</p>}
        </form>
      )}

      <nav className="space-y-1">
        {/* All Posts */}
        <Link
          href="/dashboard"
          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            !currentFolderId
              ? "bg-indigo-600 text-white font-semibold"
              : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            All Posts
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${!currentFolderId ? "bg-indigo-700 text-white" : "bg-slate-800 text-slate-400"}`}>
            {totalPostsCount}
          </span>
        </Link>

        {/* Uncategorized */}
        <Link
          href="/dashboard?folderId=uncategorized"
          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentFolderId === "uncategorized"
              ? "bg-indigo-600 text-white font-semibold"
              : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Uncategorized
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${currentFolderId === "uncategorized" ? "bg-indigo-700 text-white" : "bg-slate-800 text-slate-400"}`}>
            {uncategorizedCount}
          </span>
        </Link>

        {/* Divider */}
        {folders.length > 0 && <div className="my-2 border-t border-slate-800" />}

        {/* User Created Folders */}
        {folders.map((folder) => {
          const isActive = currentFolderId === folder.id;
          const isDeleting = deletingId === folder.id;

          return (
            <div key={folder.id} className="group relative flex items-center">
              <Link
                href={`/dashboard?folderId=${folder.id}`}
                className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2 truncate max-w-[140px]" title={folder.name}>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="truncate">{folder.name}</span>
                </span>

                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-indigo-700 text-white" : "bg-slate-800 text-slate-400"}`}>
                  {folder._count.posts}
                </span>
              </Link>

              {/* Delete Folder button */}
              <div className="ml-1 shrink-0">
                {isDeleting ? (
                  <div className="flex items-center gap-1 px-1">
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      disabled={isPending}
                      className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-600 text-white rounded cursor-pointer"
                    >
                      Del
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="px-1.5 py-0.5 text-[9px] bg-slate-800 text-slate-400 rounded"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(folder.id)}
                    title="Delete folder"
                    className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
