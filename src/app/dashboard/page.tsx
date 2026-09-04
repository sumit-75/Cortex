import { auth, signOut } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AddPostForm } from "@/components/AddPostForm";
import { PostGrid } from "@/components/PostGrid";
import { PostGridClientWrapper } from "@/components/PostGridClientWrapper";
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

async function PostGridContainer({
  userId,
  folderId,
  search,
  platform,
  folders,
}: {
  userId: string;
  folderId?: string;
  search?: string;
  platform?: string;
  folders: FolderWithCount[];
}) {
  let whereClause: any = { userId };

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

  const posts = await withRetry(() =>
    prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    })
  );

  return <PostGridClientWrapper posts={posts} folders={folders} />;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const { folderId, search, platform } = await searchParams;

  let folders: FolderWithCount[] = [];
  let totalPostsCount = 0;
  let uncategorizedCount = 0;

  try {
    // Fetch user folders with post counts (with auto-reconnect retry)
    folders = (await withRetry(() =>
      prisma.folder.findMany({
        where: { userId },
        include: {
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { createdAt: "asc" },
      })
    )) as FolderWithCount[];

    totalPostsCount = await withRetry(() =>
      prisma.post.count({
        where: { userId },
      })
    );

    uncategorizedCount = await withRetry(() =>
      prisma.post.count({
        where: {
          userId,
          folderId: null,
        },
      })
    );
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
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/90 bg-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF7900] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">Cortex</h1>
            <p className="text-[11px] text-slate-500 font-semibold">Personal Link & Media Library</p>
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
                className="rounded-full border-2 border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#FF7900] flex items-center justify-center font-bold text-white shadow-2xs">
                {session.user.name?.[0] || session.user.email?.[0] || "U"}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900">{session.user.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">{session.user.email}</p>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="outline" size="sm" className="gap-1.5 text-xs font-bold border-slate-300 hover:border-slate-400 text-slate-800">
              <LogOut className="w-3.5 h-3.5 text-slate-600" />
              <span>Sign out</span>
            </Button>
          </form>
        </div>
      </header>

      {/* Main Full-Bleed App Layout (Left Sidebar Flush to Edge) */}
      <main className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
        {/* Left Sidebar: Folder Management (Fixed & Sticky) */}
        <aside className="w-full md:w-64 shrink-0 border-r border-slate-200/90 bg-white p-5 space-y-6 md:sticky md:top-[65px] md:h-[calc(100vh-65px)] md:overflow-y-auto shadow-2xs">
          <FolderList
            folders={folders}
            totalPostsCount={totalPostsCount}
            uncategorizedCount={uncategorizedCount}
          />
        </aside>

        {/* Right Main Content Area (Centered) */}
        <section className="flex-1 p-6 md:p-8 min-w-0 bg-slate-50/70 flex justify-center">
          <div className="w-full max-w-6xl space-y-6 mx-auto">
            <AddPostForm folders={folders} defaultFolderId={folderId} />

            <SearchFilter />

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">{activeTitle}</h2>
                </div>

                {(search || platform) && (
                  <Link
                    href={folderId ? `/dashboard?folderId=${folderId}` : "/dashboard"}
                    className="text-xs text-[#FF7900] hover:text-[#e06a00] font-bold underline underline-offset-4"
                  >
                    Clear filters
                  </Link>
                )}
              </div>

              <Suspense
                key={`${folderId || "all"}-${search || ""}-${platform || "all"}`}
                fallback={<PostGrid posts={[]} isLoading={true} />}
              >
                <PostGridContainer
                  userId={userId}
                  folderId={folderId}
                  search={search}
                  platform={platform}
                  folders={folders}
                />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
