"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchOEmbed } from "@/lib/oembed";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to save posts." };
    }

    const url = formData.get("url")?.toString().trim();
    if (!url) {
      return { success: false, error: "Please enter a valid URL." };
    }

    const folderIdRaw = formData.get("folderId")?.toString().trim();
    const folderId = folderIdRaw && folderIdRaw !== "none" ? folderIdRaw : null;

    // Check if post already exists for this user
    const existingPost = await prisma.post.findFirst({
      where: {
        userId: session.user.id,
        url: url,
      },
    });

    if (existingPost) {
      return { success: false, error: "You have already saved this link!" };
    }

    // Fetch oEmbed details
    const oembed = await fetchOEmbed(url);

    // Create post in DB
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        folderId: folderId,
        url: url,
        platform: oembed.platform,
        embedHtml: oembed.embedHtml,
        title: oembed.title,
        thumbnailUrl: oembed.thumbnailUrl || null,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, post };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred while saving the post.",
    };
  }
}

export async function deletePost(postId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in." };
    }

    // Ensure the post belongs to the authenticated user
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: session.user.id,
      },
    });

    if (!post) {
      return { success: false, error: "Post not found or unauthorized." };
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to delete post.",
    };
  }
}

export async function movePostToFolder(postId: string, folderId: string | null) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in." };
    }

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: session.user.id,
      },
    });

    if (!post) {
      return { success: false, error: "Post not found or unauthorized." };
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        folderId: folderId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to move post.",
    };
  }
}
