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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const handleFolderChange = (value: string) => {
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
        className={`h-fit overflow-hidden flex flex-col justify-between border-slate-200/80 hover:shadow-lg hover:border-slate-300 transition-all duration-300 ${
          isPending ? "opacity-40 pointer-events-none" : ""
        }`}
      >
        {/* Top Card Header */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {renderPlatformBadge()}
            <h3 className="text-xs font-bold text-slate-800 truncate" title={post.title}>
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
        <div className="p-3 bg-slate-50/40 flex items-center justify-center">
          {post.platform === "youtube" ? (
            <div
              className="w-full aspect-video rounded-xl overflow-hidden shadow-xs bg-black flex items-center justify-center"
              dangerouslySetInnerHTML={{
                __html: post.embedHtml
                  .replace(/width="\d+"/g, 'width="100%"')
                  .replace(/height="\d+"/g, 'height="100%"')
                  .replace(
                    /<iframe /g,
                    '<iframe class="w-full h-full border-0 rounded-xl" '
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

        {/* Card Footer Metadata & Shadcn Custom Folder Selector */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="w-40 shrink-0">
            <Select
              value={post.folderId || "none"}
              onValueChange={handleFolderChange}
              disabled={isPending}
            >
              <SelectTrigger className="h-7 text-[11px] px-2 py-0 border-slate-200">
                <SelectValue placeholder="Select folder..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">📁 Uncategorized</SelectItem>
                {folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    📁 {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="shrink-0 font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </Card>
    </TooltipProvider>
  );
}
