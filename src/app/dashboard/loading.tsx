import { Skeleton } from "@/components/ui/skeleton";
import { Brain } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar Skeleton */}
      <header className="border-b border-slate-200/90 bg-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF7900] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-20 bg-slate-200" />
            <Skeleton className="h-3 w-36 bg-slate-100" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full bg-slate-200" />
            <div className="hidden sm:block space-y-1">
              <Skeleton className="h-3 w-24 bg-slate-200" />
              <Skeleton className="h-2.5 w-32 bg-slate-100" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-lg bg-slate-200" />
        </div>
      </header>

      {/* Main App Layout */}
      <main className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
        {/* Left Sidebar Skeleton */}
        <aside className="w-full md:w-64 shrink-0 border-r border-slate-200/90 bg-white p-5 space-y-6 md:sticky md:top-[65px] md:h-[calc(100vh-65px)] shadow-2xs">
          <div className="flex items-center justify-between px-2">
            <Skeleton className="h-4 w-28 bg-slate-200" />
            <Skeleton className="h-7 w-14 rounded-lg bg-slate-100" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-xl bg-orange-100/60" />
            <Skeleton className="h-10 w-full rounded-xl bg-slate-100" />
            <Skeleton className="h-10 w-full rounded-xl bg-slate-100" />
            <Skeleton className="h-10 w-full rounded-xl bg-slate-100" />
          </div>
        </aside>

        {/* Right Content Area Skeleton (Centered) */}
        <section className="flex-1 p-6 md:p-8 min-w-0 bg-slate-50/70">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Add Post Form Skeleton */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 bg-slate-200" />
                <Skeleton className="h-5 w-20 rounded-full bg-slate-100" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-11 flex-1 rounded-xl bg-slate-100" />
                <Skeleton className="h-11 w-full sm:w-56 rounded-xl bg-slate-100" />
                <Skeleton className="h-11 w-28 rounded-xl bg-orange-200/70" />
              </div>
            </div>

            {/* Search Filter Bar Skeleton */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Skeleton className="h-10 flex-1 rounded-xl bg-slate-100" />
                <Skeleton className="h-10 w-56 rounded-xl bg-slate-100" />
              </div>
            </div>

            {/* Section Header Skeleton */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-5 w-36 bg-slate-200" />
                <Skeleton className="h-5 w-8 rounded-full bg-slate-100" />
              </div>
            </div>

            {/* Post Cards Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden space-y-3 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20 rounded-full bg-slate-200" />
                    <Skeleton className="h-4 w-12 bg-slate-100" />
                  </div>
                  <Skeleton className="w-full aspect-video rounded-xl bg-slate-200/80" />
                  <Skeleton className="h-4 w-3/4 bg-slate-200" />
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Skeleton className="h-7 w-28 rounded-lg bg-slate-100" />
                    <Skeleton className="h-3 w-16 bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
