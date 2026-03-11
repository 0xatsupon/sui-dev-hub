"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "sui-dev-hub-bookmarks";

type BookmarkEntry = {
  title: string;
  savedAt: number;
};

type Bookmarks = Record<string, BookmarkEntry>;

function getBookmarks(): Bookmarks {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveBookmarks(bookmarks: Bookmarks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmarks>({});

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const toggleBookmark = useCallback((postId: string, title: string) => {
    setBookmarks((prev) => {
      const next = { ...prev };
      if (next[postId]) {
        delete next[postId];
      } else {
        next[postId] = { title, savedAt: Date.now() };
      }
      saveBookmarks(next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (postId: string) => !!bookmarks[postId],
    [bookmarks]
  );

  const bookmarkedIds = Object.keys(bookmarks);

  return { bookmarks, toggleBookmark, isBookmarked, bookmarkedIds };
}
