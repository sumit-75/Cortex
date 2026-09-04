import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AddPostForm } from "@/components/AddPostForm";
import { PostGrid } from "@/components/PostGrid";
import { FolderList, FolderWithCount } from "@/components/FolderList";
import { SearchFilter } from "@/components/SearchFilter";
import { Brain, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@prisma/client";

interface DashboardPageProps {
  searchParams: Promise<{
    folderId?: string;
    search?: string;
    platform?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { folderId, search, platform } = await searchParams;

  let posts: Post[] = [];
  let folders: FolderWithCount[] = [];
  let totalPostsCount = 0;
  let uncategorizedCount = 0;

  try {
    // Fetch user folders with post counts
    folders = (await prisma.folder.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })) as FolderWithCount[];

    totalPostsCount = await prisma.post.count({
      where: { userId: session.user.id },
    });

    uncategorizedCount = await prisma.post.count({
      where: {
        userId: session.user.id,
        folderId: null,
      },
    });

    // Build combined Prisma filter query
    let whereClause: any = { userId: session.user.id };

    if (folderId === "uncategorized") {
      whereClause.folderId = null;
    } else if (folderId) {
      whereClause.folderId = folderId;
    }

    if (platform && (platform === "youtube" || platform === "twitter")) {
      whereClause.platform = platform;
    }

    if (search && search.trim()) {
      whereClause.title = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error loading dashboard data:", err);
  }

  // Active folder section title
  const activeFolder = folders.find((f) => f.id === folderId);
  const activeTitle =
    folderId === "uncategorized"
      ? "Uncategorized Posts"
      : activeFolder
      ? activeFolder.name
      : "All Saved Posts";

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF7900] flex items-center justify-center text-white shadow-md">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">Cortex</h1>
            <p className="text-[10px] text-slate-500 font-medium">Personal Link & Media Library</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User avatar"}
                width={36}
                height={36}
                referrerPolicy="no-referrer"
                className="rounded-full border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#FF7900] flex items-center justify-center font-bold text-white shadow-2xs">
                {session.user.name?.[0] || session.user.email?.[0] || "U"}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900">{session.user.name}</p>
              <p className="text-[10px] text-slate-500">{session.user.email}</p>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="outline" size="sm" className="gap-1.5 text-xs">
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign out</span>
            </Button>
          </form>
        </div>
      </header>

      {/* Main Full-Bleed App Layout (Left Sidebar Flush to Edge) */}
      <main className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-61px)]">
        {/* Left Sidebar: Folder Management (Fixed & Sticky) */}
        <aside className="w-full md:w-64 shrink-0 border-r border-slate-200 bg-white p-5 space-y-6 md:sticky md:top-[61px] md:h-[calc(100vh-61px)] md:overflow-y-auto">
          <FolderList
            folders={folders}
            totalPostsCount={totalPostsCount}
            uncategorizedCount={uncategorizedCount}
          />
        </aside>

        {/* Right Main Content Area */}
        <section className="flex-1 p-6 md:p-8 space-y-6 min-w-0 max-w-7xl bg-white">
          <AddPostForm folders={folders} defaultFolderId={folderId} />

          <SearchFilter />

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{activeTitle}</h2>
                <Badge variant="secondary">{posts.length}</Badge>
              </div>

              {(search || platform) && (
                <Link
                  href={folderId ? `/dashboard?folderId=${folderId}` : "/dashboard"}
                  className="text-xs text-[#FF7900] hover:text-[#e06a00] font-semibold underline underline-offset-2"
                >
                  Clear filters
                </Link>
              )}
            </div>

            <PostGrid posts={posts} folders={folders} />
          </div>
        </section>
      </main>
    </div>
  );
}
