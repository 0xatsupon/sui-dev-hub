"use client";

import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAllPostIds, type Post } from "@/components/PostList";
import { decodeBytes, parseTitle } from "@/lib/utils";

export function RelatedPosts({ currentPostId, tags }: { currentPostId: string; tags: string[] }) {
  const router = useRouter();
  const { postIds } = useAllPostIds();

  const { data: objects } = useSuiClientQuery(
    "multiGetObjects",
    { ids: postIds, options: { showContent: true } },
    { enabled: postIds.length > 0 }
  );

  const relatedPosts = useMemo(() => {
    if (!objects || tags.length === 0) return [];

    const currentTags = new Set(tags.filter((t) => t !== "AI"));
    if (currentTags.size === 0) return [];

    const scored: { post: Post; cleanTitle: string; tags: string[]; score: number }[] = [];

    for (const obj of objects) {
      if (!obj.data?.content) continue;
      const post = obj.data as unknown as Post;
      if (post.objectId === currentPostId) continue;

      const rawTitle = decodeBytes(post.content.fields.title);
      const { cleanTitle, tags: postTags } = parseTitle(rawTitle);
      const overlap = postTags.filter((t) => currentTags.has(t)).length;
      if (overlap > 0) {
        scored.push({ post, cleanTitle, tags: postTags, score: overlap });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3);
  }, [objects, currentPostId, tags]);

  if (relatedPosts.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mt-4">
      <h3 className="text-lg font-semibold text-white mb-4">関連記事</h3>
      <div className="space-y-3">
        {relatedPosts.map(({ post, cleanTitle, tags: postTags }) => (
          <div
            key={post.objectId}
            onClick={() => router.push(`/post/${post.objectId}`)}
            className="bg-gray-800/50 hover:bg-gray-800 rounded-lg p-4 cursor-pointer transition-colors border border-gray-700/50 hover:border-gray-600"
          >
            <h4 className="text-white font-medium text-sm mb-1">{cleanTitle}</h4>
            <div className="flex flex-wrap gap-1">
              {postTags.filter((t) => t !== "AI").map((tag) => (
                <span key={tag} className="bg-blue-950 text-blue-300 text-[10px] px-1.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
