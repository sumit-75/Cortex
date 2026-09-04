"use client";

import type { Post } from "@prisma/client";
import { PostGrid } from "@/components/PostGrid";
import type { FolderWithCount } from "@/components/FolderList";
import { useNavLoading } from "@/components/NavigationLoadingContext";

interface PostGridClientWrapperProps {
  posts: Post[];
  folders?: FolderWithCount[];
}

export function PostGridClientWrapper({ posts, folders = [] }: PostGridClientWrapperProps) {
  const { isNavigating } = useNavLoading();

  if (isNavigating) {
    return <PostGrid posts={[]} folders={folders} isLoading={true} />;
  }

  return <PostGrid posts={posts} folders={folders} />;
}
