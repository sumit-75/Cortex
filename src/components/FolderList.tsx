"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useNavLoading } from "@/components/NavigationLoadingContext";
import { createFolder, deleteFolder } from "@/app/actions/folder";
import {
  Layers,
  FileQuestion,
  Folder,
  Trash2,
  Plus,
  X,
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
  const { activeFolderId, navigateToFolder } = useNavLoading();
  
  const currentFolderId =
    activeFolderId !== undefined ? activeFolderId : searchParams.get("folderId");

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
      <div className="space-y-4">
        {/* Sidebar Section Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#FF7900]" />
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              Library Folders
            </h2>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                className="h-7 px-2.5 text-xs font-bold text-[#FF7900] hover:text-[#e06a00] hover:bg-orange-50 border border-orange-200/80 bg-orange-50/50"
              >
                {showAddForm ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                    New
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
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
                className="h-8 text-xs font-medium border-slate-300 focus:border-[#FF7900]"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !newFolderName.trim()}
                className="h-8 shrink-0 bg-[#FF7900] hover:bg-[#e06a00] text-white font-bold"
              >
                {isPending ? "..." : "Save"}
              </Button>
            </div>
            {error && <p className="text-[10px] text-rose-600 px-1 font-semibold">{error}</p>}
          </form>
        )}

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {/* All Posts */}
          <Link
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigateToFolder(null);
            }}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              !currentFolderId
                ? "bg-[#FF7900] text-white shadow-md shadow-orange-500/20 border border-[#e06a00]"
                : "bg-white text-slate-800 hover:bg-orange-50/80 hover:text-[#FF7900] border border-transparent hover:border-orange-200/80"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Layers className={`w-4 h-4 transition-transform group-hover:scale-110 ${!currentFolderId ? "text-white" : "text-slate-500 group-hover:text-[#FF7900]"}`} />
              <span>All Posts</span>
            </span>
            <Badge
              variant={!currentFolderId ? "default" : "secondary"}
              className={!currentFolderId ? "bg-[#e06a00] text-white font-bold" : "bg-slate-100/90 text-slate-700 border border-slate-200/80 font-bold group-hover:bg-orange-100 group-hover:text-[#FF7900] group-hover:border-orange-200"}
            >
              {totalPostsCount}
            </Badge>
          </Link>

          {/* Uncategorized */}
          <Link
            href="/dashboard?folderId=uncategorized"
            onClick={(e) => {
              e.preventDefault();
              navigateToFolder("uncategorized");
            }}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentFolderId === "uncategorized"
                ? "bg-[#FF7900] text-white shadow-md shadow-orange-500/20 border border-[#e06a00]"
                : "bg-white text-slate-800 hover:bg-orange-50/80 hover:text-[#FF7900] border border-transparent hover:border-orange-200/80"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileQuestion className={`w-4 h-4 transition-transform group-hover:scale-110 ${currentFolderId === "uncategorized" ? "text-white" : "text-slate-500 group-hover:text-[#FF7900]"}`} />
              <span>Uncategorized</span>
            </span>
            <Badge
              variant={currentFolderId === "uncategorized" ? "default" : "secondary"}
              className={currentFolderId === "uncategorized" ? "bg-[#e06a00] text-white font-bold" : "bg-slate-100/90 text-slate-700 border border-slate-200/80 font-bold group-hover:bg-orange-100 group-hover:text-[#FF7900] group-hover:border-orange-200"}
            >
              {uncategorizedCount}
            </Badge>
          </Link>

          {/* Divider */}
          {folders.length > 0 && <div className="my-2 border-t border-slate-200/80" />}

          {/* Custom User Folders */}
          {folders.map((folder) => {
            const isActive = currentFolderId === folder.id;
            const isDeleting = deletingId === folder.id;

            return (
              <div key={folder.id} className="group relative flex items-center">
                <Link
                  href={`/dashboard?folderId=${folder.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToFolder(folder.id);
                  }}
                  className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#FF7900] text-white shadow-md shadow-orange-500/20 border border-[#e06a00]"
                      : "bg-white text-slate-800 hover:bg-orange-50/80 hover:text-[#FF7900] border border-transparent hover:border-orange-200/80"
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate max-w-[140px]" title={folder.name}>
                    <Folder className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500 group-hover:text-[#FF7900]"}`} />
                    <span className="truncate">{folder.name}</span>
                  </span>

                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={isActive ? "bg-[#e06a00] text-white font-bold" : "bg-slate-100/90 text-slate-700 border border-slate-200/80 font-bold group-hover:bg-orange-100 group-hover:text-[#FF7900] group-hover:border-orange-200"}
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
                        className="h-6 px-1.5 text-[9px] font-bold"
                      >
                        Del
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingId(null)}
                        className="h-6 px-1.5 text-[9px] font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setDeletingId(folder.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Delete folder</TooltipContent>
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
