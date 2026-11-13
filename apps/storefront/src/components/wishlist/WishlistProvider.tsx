"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
  type ReactNode,
} from "react";

interface WishlistContextValue {
  readonly ids: ReadonlySet<string>;
  readonly toggle: (productId: string) => void;
  readonly has: (productId: string) => boolean;
}

const STORAGE_KEY = "tamadee_wishlist_ids";

const WishlistContext = createContext<WishlistContextValue>({
  ids: new Set<string>(),
  toggle: () => undefined,
  has: () => false,
});

export function WishlistProvider({
  children,
}: {
  readonly children: ReactNode;
}): JSX.Element {
  const [ids, setIds] = useState<Set<string>>(() => new Set<string>());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setIds(
            new Set(parsed.filter((v): v is string => typeof v === "string"))
          );
        }
      }
    } catch {
      // Ignore malformed storage
    }
  }, []);

  const toggle = useCallback((productId: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const has = useCallback((productId: string) => ids.has(productId), [ids]);

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, toggle, has }),
    [ids, toggle, has]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  return useContext(WishlistContext);
}
