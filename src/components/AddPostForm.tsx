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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <Card className="shadow-xs border-slate-200 hover:border-slate-300 transition-all bg-white rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="url-input" className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <Link2 className="w-4 h-4 text-[#FF7900] stroke-[2.5]" />
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
                className="h-11 pl-4 text-xs font-semibold border-slate-300 hover:border-slate-400 focus:border-[#FF7900]"
              />
            </div>

            {folders.length > 0 && (
              <div className="w-full sm:w-48 shrink-0">
                <Select
                  value={selectedFolderId}
                  onValueChange={setSelectedFolderId}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-11 border-slate-300 hover:border-slate-400 font-bold text-slate-900">
                    <SelectValue placeholder="Select folder..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">📁 No Folder (Uncategorized)</SelectItem>
                    {folders.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        📁 {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending || !url.trim()}
              className="h-11 px-6 text-xs font-bold gap-2 shrink-0 shadow-xs hover:shadow-md bg-[#FF7900] hover:bg-[#e06a00] text-white"
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
            <div className="mt-3 p-3.5 bg-rose-50 border border-rose-300/80 rounded-xl text-xs font-bold text-rose-800 shadow-2xs animate-in fade-in-50">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-300/80 rounded-xl text-xs font-bold text-emerald-800 shadow-2xs animate-in fade-in-50">
              {success}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
