"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createFolder, deleteFolder } from "@/app/actions/folder";
import {
  Layers,
  FileQuestion,
  Folder,
  FolderPlus,
  Trash2,
  Plus,
  X,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm">
        {/* Sidebar Section Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Library Folders
            </h2>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                className="h-7 px-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                {showAddForm ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    New
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {showAddForm ? "Close form" : "Create new category folder"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Add Folder Inline Form */}
        {showAddForm && (
          <form onSubmit={handleCreateFolder} className="space-y-2 px-1 animate-in fade-in-50 duration-200">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g. Tech)..."
                autoFocus
                disabled={isPending}
                className="h-8 text-xs"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !newFolderName.trim()}
                className="h-8 shrink-0"
              >
                {isPending ? "..." : "Save"}
              </Button>
            </div>
            {error && <p className="text-[10px] text-rose-600 px-1 font-medium">{error}</p>}
          </form>
        )}

        {/* Navigation List */}
        <nav className="space-y-1">
          {/* All Posts */}
          <Link
            href="/dashboard"
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              !currentFolderId
                ? "bg-indigo-600 text-white font-semibold shadow-sm"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Layers className={`w-4 h-4 transition-transform group-hover:scale-110 ${!currentFolderId ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
              <span>All Posts</span>
            </span>
            <Badge
              variant={!currentFolderId ? "default" : "secondary"}
              className={!currentFolderId ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"}
            >
              {totalPostsCount}
            </Badge>
          </Link>

          {/* Uncategorized */}
          <Link
            href="/dashboard?folderId=uncategorized"
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              currentFolderId === "uncategorized"
                ? "bg-indigo-600 text-white font-semibold shadow-sm"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileQuestion className={`w-4 h-4 transition-transform group-hover:scale-110 ${currentFolderId === "uncategorized" ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
              <span>Uncategorized</span>
            </span>
            <Badge
              variant={currentFolderId === "uncategorized" ? "default" : "secondary"}
              className={currentFolderId === "uncategorized" ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"}
            >
              {uncategorizedCount}
            </Badge>
          </Link>

          {/* Divider */}
          {folders.length > 0 && <div className="my-2 border-t border-slate-200" />}

          {/* Custom User Folders */}
          {folders.map((folder) => {
            const isActive = currentFolderId === folder.id;
            const isDeleting = deletingId === folder.id;

            return (
              <div key={folder.id} className="group relative flex items-center">
                <Link
                  href={`/dashboard?folderId=${folder.id}`}
                  className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate max-w-[140px]" title={folder.name}>
                    <Folder className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
                    <span className="truncate">{folder.name}</span>
                  </span>

                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={isActive ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"}
                  >
                    {folder._count.posts}
                  </Badge>
                </Link>

                {/* Delete Folder button */}
                <div className="ml-1 shrink-0">
                  {isDeleting ? (
                    <div className="flex items-center gap-1 px-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteFolder(folder.id)}
                        disabled={isPending}
                        className="h-6 px-1.5 text-[9px]"
                      >
                        Del
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingId(null)}
                        className="h-6 px-1.5 text-[9px]"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setDeletingId(folder.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Delete folder</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}
