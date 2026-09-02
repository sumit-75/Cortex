import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Your Personal <span className="text-indigo-500">Second Brain</span>
        </h1>
        <p className="text-lg text-slate-400">
          Save posts and videos from YouTube, Twitter/X, and Instagram into one central, organized library.
        </p>

        <div className="pt-4 flex justify-center">
          {session ? (
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg"
            >
              Go to Dashboard &rarr;
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg"
            >
              Get Started with Google &rarr;
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
