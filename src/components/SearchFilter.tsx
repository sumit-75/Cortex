"use client";

import { useState, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useNavLoading } from "@/components/NavigationLoadingContext";
import { Search, X } from "lucide-react";
import { YoutubeIcon, TwitterIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function SearchFilter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { navigateToUrl } = useNavLoading();

  const currentSearch = searchParams.get("search") || "";
  const currentPlatform = searchParams.get("platform") || "";

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Keep search input state in sync with URL
  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const updateQueryParams = (newSearch: string, newPlatform: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSearch.trim()) {
      params.set("search", newSearch.trim());
    } else {
      params.delete("search");
    }

    if (newPlatform && newPlatform !== "all") {
      params.set("platform", newPlatform);
    } else {
      params.delete("platform");
    }

    const targetUrl = `${pathname}?${params.toString()}`;
    navigateToUrl(targetUrl);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateQueryParams(value, currentPlatform);
  };

  const handlePlatformChange = (platform: string) => {
    updateQueryParams(searchTerm, platform);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    updateQueryParams("", currentPlatform);
  };

  return (
    <Card className="shadow-xs bg-white border border-slate-200 rounded-2xl">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>

            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search saved posts by title..."
              className="pl-9 pr-9 font-semibold border-slate-300 hover:border-slate-400 focus:border-[#FF7900] text-sm sm:text-xs"
            />

            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Platform Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full no-scrollbar shrink-0">
            <Button
              variant={!currentPlatform || currentPlatform === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => handlePlatformChange("all")}
              className={`h-8 text-xs px-3 font-bold shrink-0 transition-all ${
                !currentPlatform || currentPlatform === "all"
                  ? "bg-[#FF7900] hover:bg-[#e06a00] text-white shadow-2xs"
                  : "text-slate-700 hover:bg-white hover:text-slate-900"
              }`}
            >
              All
            </Button>
            <Button
              variant={currentPlatform === "youtube" ? "default" : "ghost"}
              size="sm"
              onClick={() => handlePlatformChange("youtube")}
              className={`h-8 text-xs px-3 font-bold gap-1.5 shrink-0 transition-all ${
                currentPlatform === "youtube"
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-2xs"
                  : "text-slate-700 hover:bg-white hover:text-slate-900"
              }`}
            >
              <YoutubeIcon className={`w-3.5 h-3.5 ${currentPlatform === "youtube" ? "text-white" : "text-red-600"}`} />
              YouTube
            </Button>
            <Button
              variant={currentPlatform === "twitter" ? "default" : "ghost"}
              size="sm"
              onClick={() => handlePlatformChange("twitter")}
              className={`h-8 text-xs px-3 font-bold gap-1.5 shrink-0 transition-all ${
                currentPlatform === "twitter"
                  ? "bg-sky-500 hover:bg-sky-600 text-white shadow-2xs"
                  : "text-slate-700 hover:bg-white hover:text-slate-900"
              }`}
            >
              <TwitterIcon className={`w-3 h-3 ${currentPlatform === "twitter" ? "text-white" : "text-sky-500"}`} />
              Twitter / X
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
