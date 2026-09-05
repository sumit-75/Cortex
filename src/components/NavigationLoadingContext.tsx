"use client";

import {
  createContext,
  useContext,
  useState,
  useTransition,
  useEffect,
  ReactNode,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface NavContextType {
  isNavigating: boolean;
  activeFolderId: string | null | undefined;
  navigateToFolder: (folderId: string | null) => void;
  navigateToUrl: (href: string) => void;
}

const NavContext = createContext<NavContextType>({
  isNavigating: false,
  activeFolderId: undefined,
  navigateToFolder: () => {},
  navigateToUrl: () => {},
});

function NavContextInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folderId");

  const [isPending, startTransition] = useTransition();
  const [optimisticFolderId, setOptimisticFolderId] = useState<string | null | undefined>(
    undefined
  );
  const [isNavigating, setIsNavigating] = useState(false);

  // Sync optimistic folder state with actual URL search params once navigation finishes
  useEffect(() => {
    setOptimisticFolderId(undefined);
    setIsNavigating(false);
  }, [searchParams]);

  const navigateToFolder = (folderId: string | null) => {
    setOptimisticFolderId(folderId);
    setIsNavigating(true);

    const params = new URLSearchParams(searchParams.toString());
    if (folderId) {
      params.set("folderId", folderId);
    } else {
      params.delete("folderId");
    }

    const newUrl = params.toString() ? `/dashboard?${params.toString()}` : "/dashboard";

    startTransition(() => {
      router.push(newUrl);
    });
  };

  const navigateToUrl = (href: string) => {
    setIsNavigating(true);
    startTransition(() => {
      router.push(href);
    });
  };

  const effectiveFolderId =
    optimisticFolderId !== undefined ? optimisticFolderId : currentFolderId;

  return (
    <NavContext.Provider
      value={{
        isNavigating: isPending || isNavigating,
        activeFolderId: effectiveFolderId,
        navigateToFolder,
        navigateToUrl,
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

function NavContextFallback({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateToFolder = (folderId: string | null) => {
    setIsNavigating(true);
    const newUrl = folderId ? `/dashboard?folderId=${folderId}` : "/dashboard";
    startTransition(() => {
      router.push(newUrl);
    });
  };

  const navigateToUrl = (href: string) => {
    setIsNavigating(true);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <NavContext.Provider
      value={{
        isNavigating: isPending || isNavigating,
        activeFolderId: undefined,
        navigateToFolder,
        navigateToUrl,
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<NavContextFallback>{children}</NavContextFallback>}>
      <NavContextInner>{children}</NavContextInner>
    </Suspense>
  );
}

export function useNavLoading() {
  return useContext(NavContext);
}

