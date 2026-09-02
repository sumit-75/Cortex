import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import { AddPostForm } from "@/components/AddPostForm";
import { PostGrid } from "@/components/PostGrid";
import { FolderList, FolderWithCount } from "@/components/FolderList";
import type { Post } from "@prisma/client";

interface DashboardPageProps {
  searchParams: Promise<{
    folderId?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { folderId } = await searchParams;

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

    // Determine query filter based on active folder tab
    let whereClause: any = { userId: session.user.id };

    if (folderId === "uncategorized") {
      whereClause.folderId = null;
    } else if (folderId) {
      whereClause.folderId = folderId;
    }

    posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error loading dashboard data:", err);
  }

  // Get current active folder name for section heading
  const activeFolder = folders.find((f) => f.id === folderId);
  const activeTitle =
    folderId === "uncategorized"
      ? "Uncategorized Posts"
      : activeFolder
      ? activeFolder.name
      : "All Saved Posts";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Second Brain</span>
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User avatar"}
                width={36}
                height={36}
                referrerPolicy="no-referrer"
                className="rounded-full border border-slate-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                {session.user.name?.[0] || session.user.email?.[0] || "U"}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white">{session.user.name}</p>
              <p className="text-xs text-slate-400">{session.user.email}</p>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar: Folder Management */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <FolderList
            folders={folders}
            totalPostsCount={totalPostsCount}
            uncategorizedCount={uncategorizedCount}
          />
        </aside>

        {/* Right Main Area: Input Form & Post Grid */}
        <section className="flex-1 space-y-8 min-w-0">
          <AddPostForm folders={folders} defaultFolderId={folderId} />

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-lg font-bold text-white">
                {activeTitle}{" "}
                <span className="text-xs font-normal text-slate-400">
                  ({posts.length})
                </span>
              </h2>
            </div>

            <PostGrid posts={posts} folders={folders} />
          </div>
        </section>
      </main>
    </div>
  );
}
