import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF7900] text-xs font-bold shadow-2xs">
          ✨ Your Personal Knowledge Vault
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Welcome to <span className="text-[#FF7900]">Cortex</span>
        </h1>
        <p className="text-lg text-slate-600 font-medium">
          Save posts and videos from YouTube and Twitter/X into one central, organized library.
        </p>

        <div className="pt-4 flex justify-center">
          {session ? (
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-[#FF7900] hover:bg-[#e06a00] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Go to Dashboard &rarr;
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-8 py-3.5 bg-[#FF7900] hover:bg-[#e06a00] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Get Started with Google &rarr;
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
