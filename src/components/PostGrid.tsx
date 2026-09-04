"use client";

import Script from "next/script";
import type { Post } from "@prisma/client";
import { PostCard } from "@/components/PostCard";
import type { FolderWithCount } from "@/components/FolderList";

interface PostGridProps {
  posts: Post[];
  folders?: FolderWithCount[];
}

export function PostGrid({ posts, folders = [] }: PostGridProps) {
  const handleTwitterScriptLoad = () => {
    if (window.twttr?.widgets?.load) {
      window.twttr.widgets.load();
    }
  };

  if (posts.length === 0) {
    return (
      <div className="p-12 border border-dashed border-slate-300 rounded-3xl text-center bg-white shadow-sm max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-800">No saved posts in this view</h3>
        <p className="mt-1 text-xs text-slate-500">
          Paste a link from YouTube or Twitter/X above or switch folders to view your posts!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Twitter Widgets Script */}
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onLoad={handleTwitterScriptLoad}
      />

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} folders={folders} />
        ))}
      </div>
    </>
  );
}
