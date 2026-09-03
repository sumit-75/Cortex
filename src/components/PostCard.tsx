"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Post } from "@prisma/client";
import { deletePost, movePostToFolder } from "@/app/actions/post";
import type { FolderWithCount } from "@/components/FolderList";
import { YoutubeIcon, TwitterIcon } from "@/components/icons";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          <Badge variant="youtube" className="gap-1 shrink-0">
            <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
            YouTube
          </Badge>
        );
      case "twitter":
        return (
          <Badge variant="twitter" className="gap-1 shrink-0">
            <TwitterIcon className="w-3 h-3 text-sky-500" />
            Twitter / X
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <Card
        ref={containerRef}
        className={`overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all ${
          isPending ? "opacity-40 pointer-events-none" : ""
        }`}
      >
        {/* Top Card Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {renderPlatformBadge()}
            <h3 className="text-xs font-semibold text-slate-800 truncate" title={post.title}>
              {post.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors inline-flex items-center"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent>Open original link</TooltipContent>
            </Tooltip>

            {showConfirmDelete ? (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="h-7 px-2 text-[10px]"
                >
                  {isPending ? "..." : "Confirm"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowConfirmDelete(false)}
                  className="h-7 px-2 text-[10px]"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Delete post</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Embed Media Content */}
        <div className="p-4 flex-1 flex items-center justify-center bg-slate-50/60">
          {post.platform === "youtube" ? (
            <div
              className="w-full aspect-video rounded-xl overflow-hidden shadow-xs bg-black flex items-center justify-center"
              dangerouslySetInnerHTML={{
                __html: post.embedHtml.replace(
                  /<iframe /g,
                  '<iframe class="w-full h-full border-0" '
                ),
              }}
            />
          ) : (
            <div
              className="w-full overflow-x-auto flex justify-center text-slate-900 text-sm py-1 [&_blockquote]:max-w-full [&_iframe]:mx-auto"
              dangerouslySetInnerHTML={{ __html: post.embedHtml }}
            />
          )}
        </div>

        {/* Card Footer Metadata & Folder Movement Dropdown */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <select
            value={post.folderId || "none"}
            onChange={handleFolderChange}
            disabled={isPending}
            className="bg-white border border-slate-200 text-slate-700 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[150px] truncate shadow-2xs font-medium"
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
      </Card>
    </TooltipProvider>
  );
}
