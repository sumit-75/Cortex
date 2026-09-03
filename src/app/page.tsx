import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          ✨ Your Personal Knowledge Vault
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
          Your Personal <span className="text-indigo-600">Second Brain</span>
        </h1>
        <p className="text-lg text-slate-600">
          Save posts and videos from YouTube and Twitter/X into one central, organized library.
        </p>

        <div className="pt-4 flex justify-center">
          {session ? (
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Go to Dashboard &rarr;
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Get Started with Google &rarr;
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
