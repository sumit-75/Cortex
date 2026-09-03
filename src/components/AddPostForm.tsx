"use client";

import { useState, useTransition } from "react";
import { createPost } from "@/app/actions/post";
import { detectPlatform, Platform } from "@/lib/oembed";
import type { FolderWithCount } from "@/components/FolderList";
import { YoutubeIcon, TwitterIcon } from "@/components/icons";
import { Link2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";

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
          <Badge variant="youtube" className="gap-1 shadow-2xs">
            <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
            YouTube
          </Badge>
        );
      case "twitter":
        return (
          <Badge variant="twitter" className="gap-1 shadow-2xs">
            <TwitterIcon className="w-3 h-3 text-sky-500" />
            Twitter / X
          </Badge>
        );
    }
  };

  return (
    <TooltipProvider>
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="url-input" className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-indigo-600" />
              Save a new link
            </label>
            {getPlatformBadge(detectedPlatform)}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
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
                className="h-11 pl-4"
              />
            </div>

            {folders.length > 0 && (
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 cursor-pointer h-11"
              >
                <option value="none">No Folder (Uncategorized)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            )}

            <Button
              type="submit"
              disabled={isPending || !url.trim()}
              className="h-11 px-6 text-xs font-semibold gap-2 shrink-0"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Post</span>
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 animate-in fade-in-50">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 animate-in fade-in-50">
              {success}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
