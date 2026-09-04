"use server";

import { auth } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFolder(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to create folders." };
    }

    const userId = session.user.id;

    const name = formData.get("name")?.toString().trim();
    if (!name) {
      return { success: false, error: "Please enter a folder name." };
    }

    // Check if folder with same name exists for this user (with auto-reconnect retry)
    const existing = await withRetry(() =>
      prisma.folder.findFirst({
        where: {
          userId: userId,
          name: { equals: name, mode: "insensitive" },
        },
      })
    );

    if (existing) {
      return { success: false, error: "A folder with this name already exists." };
    }

    const folder = await withRetry(() =>
      prisma.folder.create({
        data: {
          userId: userId,
          name: name,
        },
      })
    );

    revalidatePath("/dashboard");
    return { success: true, folder };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create folder.",
    };
  }
}

export async function deleteFolder(folderId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in." };
    }

    const userId = session.user.id;

    const folder = await withRetry(() =>
      prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: userId,
        },
      })
    );

    if (!folder) {
      return { success: false, error: "Folder not found or unauthorized." };
    }

    await withRetry(() =>
      prisma.folder.delete({
        where: { id: folderId },
      })
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to delete folder.",
    };
  }
}
