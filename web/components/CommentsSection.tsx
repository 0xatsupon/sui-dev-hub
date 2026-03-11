"use client";

import { useState, useEffect } from "react";
import { useSuiClientQuery, useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/lib/sui";
import { useZkLogin } from "@/context/ZkLoginContext";
import { zkLoginSponsoredSignAndExecute } from "@/lib/zklogin";
import { useAuthorName } from "@/lib/profile";
import { decodeBytes } from "@/lib/utils";

type CommentEvent = {
  comment_id: string;
  post_id: string;
  author: string;
};

type CommentObject = {
  objectId: string;
  content: {
    fields: {
      content: number[];
      author: string;
      created_at: string;
    };
  };
};

function CommentCard({ comment }: { comment: CommentObject }) {
  const { displayName, suiNsName } = useAuthorName(comment.content.fields.author);
  const text = decodeBytes(comment.content.fields.content);

  return (
    <div className="border-t border-gray-800 pt-3">
      <p className="text-xs text-gray-500 mb-1">
        <span className={`inline-block px-2 py-0.5 rounded-md font-medium text-[10px] mr-2 ${
          suiNsName ? "bg-blue-900 text-blue-300" : "bg-gray-800 text-gray-300"
        }`}>
          {suiNsName ? `🔷 ${displayName}` : displayName}
        </span>
      </p>
      <p className="text-gray-200 text-sm">{text}</p>
    </div>
  );
}

export function CommentsSection({ postId }: { postId: string }) {
  const account = useCurrentAccount();
  const { session } = useZkLogin();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute, isPending: walletPending } = useSignAndExecuteTransaction();
  const [commentText, setCommentText] = useState("");
  const [zkPending, setZkPending] = useState(false);
  const [commentIds, setCommentIds] = useState<string[]>([]);
  const isPending = walletPending || zkPending;

  // Fetch CommentCreated events for this post
  const { data: events, refetch } = useSuiClientQuery("queryEvents", {
    query: { MoveEventType: `${PACKAGE_ID}::platform::CommentCreated` },
    limit: 50,
    order: "ascending",
  });

  useEffect(() => {
    if (!events?.data) return;
    const ids = events.data
      .filter((e) => (e.parsedJson as CommentEvent)?.post_id === postId)
      .map((e) => (e.parsedJson as CommentEvent).comment_id);
    setCommentIds(ids);
  }, [events, postId]);

  const { data: commentObjects } = useSuiClientQuery(
    "multiGetObjects",
    { ids: commentIds, options: { showContent: true } },
    { enabled: commentIds.length > 0 }
  );

  const validComments = (commentObjects ?? []).filter((o) => o.data?.content);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!account && !session) return;

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::platform::add_comment`,
      arguments: [
        tx.object(postId),
        tx.pure.string(commentText.trim()),
      ],
    });

    if (session && !account) {
      try {
        setZkPending(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await zkLoginSponsoredSignAndExecute(session, tx, suiClient as any);
        setCommentText("");
        setTimeout(() => refetch(), 2000);
      } catch (err) {
        console.error("Comment failed:", err);
      } finally {
        setZkPending(false);
      }
      return;
    }

    signAndExecute({ transaction: tx }, {
      onSuccess: () => {
        setCommentText("");
        setTimeout(() => refetch(), 2000);
      }
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-white mb-4">💬 コメント</h2>

      {/* Comment list */}
      <div className="space-y-4 mb-6">
        {validComments.length === 0 ? (
          <p className="text-gray-500 text-sm">まだコメントがありません。最初のコメントを投稿してみましょう！</p>
        ) : (
          validComments.map((o) =>
            o.data ? (
              <CommentCard key={o.data.objectId} comment={o.data as unknown as CommentObject} />
            ) : null
          )
        )}
      </div>

      {/* Comment form */}
      {(account || session) ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="コメントを書く..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="submit"
            disabled={isPending || !commentText.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            {isPending ? "送信中..." : "送信"}
          </button>
        </form>
      ) : (
        <p className="text-gray-500 text-sm">コメントするにはウォレットを接続してください。</p>
      )}
    </div>
  );
}
