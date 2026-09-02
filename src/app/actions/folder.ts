"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFolder(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to create folders." };
    }

    const name = formData.get("name")?.toString().trim();
    if (!name) {
      return { success: false, error: "Please enter a folder name." };
    }

    // Check if folder with same name exists for this user
    const existing = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existing) {
      return { success: false, error: "A folder with this name already exists." };
    }

    const folder = await prisma.folder.create({
      data: {
        userId: session.user.id,
        name: name,
      },
    });

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

    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: session.user.id,
      },
    });

    if (!folder) {
      return { success: false, error: "Folder not found or unauthorized." };
    }

    await prisma.folder.delete({
      where: { id: folderId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to delete folder.",
    };
  }
}
