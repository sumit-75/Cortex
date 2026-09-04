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

  // Normalize Twitter URL and guarantee fallback anchor text for empty blockquotes
  const normalizedTwitterUrl = post.url.replace(/^https?:\/\/(www\.)?x\.com\//i, "https://twitter.com/");

  let cleanEmbedHtml = post.embedHtml || "";
  if (post.platform === "twitter") {
    if (!cleanEmbedHtml.trim() || !cleanEmbedHtml.includes("<blockquote")) {
      cleanEmbedHtml = `<blockquote class="twitter-tweet"><a href="${normalizedTwitterUrl}">View Post on Twitter / X &rarr;</a></blockquote>`;
    } else {
      cleanEmbedHtml = cleanEmbedHtml.replace(/href="https?:\/\/(www\.)?x\.com\//gi, 'href="https://twitter.com/');
      // Inject fallback link text into empty <a></a> anchors so card is never empty
      cleanEmbedHtml = cleanEmbedHtml.replace(
        /<a ([^>]+)><\/a>/gi,
        `<a $1 style="color: #0284c7; font-weight: 600; text-decoration: underline;">View Post on Twitter / X &rarr;</a>`
      );
    }
  }

  // Trigger Twitter widget hydration when Twitter embed mounts
  useEffect(() => {
    if (post.platform === "twitter" && containerRef.current) {
      const hydrate = () => {
        if (window.twttr?.widgets?.load) {
          window.twttr.widgets.load(containerRef.current);
        }
      };

      hydrate();
      const interval = setInterval(hydrate, 500);
      const timeout = setTimeout(() => clearInterval(interval), 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [post.platform, cleanEmbedHtml]);

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
        className={`break-inside-avoid inline-block w-full h-fit overflow-hidden flex flex-col justify-between border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md rounded-2xl transition-all duration-300 mb-6 bg-white ${
          isPending ? "opacity-40 pointer-events-none" : ""
        }`}
      >
        {/* Top Card Header */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {renderPlatformBadge()}
            <h3 className="text-xs font-bold text-slate-900 truncate" title={post.title}>
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
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 rounded-lg transition-colors inline-flex items-center"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="top">Open original link</TooltipContent>
            </Tooltip>

            {showConfirmDelete ? (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="h-7 px-2 text-[10px] font-bold"
                >
                  {isPending ? "..." : "Confirm"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowConfirmDelete(false)}
                  className="h-7 px-2 text-[10px] font-semibold"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-100/70 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Delete post</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Embed Media Content */}
        <div className="p-4 bg-white flex items-center justify-center min-h-[80px]">
          {post.platform === "youtube" ? (
            <div
              className="w-full aspect-video rounded-xl overflow-hidden shadow-2xs bg-black flex items-center justify-center border border-slate-200/60"
              dangerouslySetInnerHTML={{
                __html: cleanEmbedHtml
                  .replace(/width="\d+"/g, 'width="100%"')
                  .replace(/height="\d+"/g, 'height="100%"')
                  .replace(/src="([^"]+)"/g, (_match, srcUrl) => {
                    if (srcUrl.includes("youtube.com") || srcUrl.includes("youtu.be")) {
                      const separator = srcUrl.includes("?") ? "&" : "?";
                      return `src="${srcUrl}${separator}vq=hd1080&rel=0"`;
                    }
                    return _match;
                  })
                  .replace(
                    /<iframe /g,
                    '<iframe class="w-full h-full border-0 rounded-xl" loading="lazy" '
                  ),
              }}
            />
          ) : (
            <div
              className="w-full overflow-x-auto flex justify-center text-slate-900 text-xs py-1 [&_blockquote]:max-w-full [&_iframe]:mx-auto"
              dangerouslySetInnerHTML={{ __html: cleanEmbedHtml }}
            />
          )}
        </div>

        {/* Card Footer Metadata & Folder Selector */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2 text-xs text-slate-600">
          <div className="w-44 shrink-0">
            <Select
              value={post.folderId || "none"}
              onValueChange={handleFolderChange}
              disabled={isPending}
            >
              <SelectTrigger className="h-8 text-xs font-semibold px-2.5 py-1 border-slate-300 hover:border-slate-400 bg-white text-slate-900 shadow-2xs rounded-lg">
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

          <span className="shrink-0 font-semibold text-slate-600 text-[11px]">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </Card>
    </TooltipProvider>
  );
}
