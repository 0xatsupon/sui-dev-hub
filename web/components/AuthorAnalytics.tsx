"use client";

import { useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID, OLD_PACKAGE_ID } from "@/lib/sui";
import { useMemo } from "react";
import { decodeBytes } from "@/lib/utils";

export function AuthorAnalytics({ address }: { address: string }) {
  // 投稿イベントを取得
  const { data: newTxs } = useSuiClientQuery("queryTransactionBlocks", {
    filter: { MoveFunction: { package: PACKAGE_ID, module: "platform", function: "create_post" } },
    options: { showEvents: true },
    limit: 50,
  });
  const { data: stakedTxs } = useSuiClientQuery("queryTransactionBlocks", {
    filter: { MoveFunction: { package: PACKAGE_ID, module: "platform", function: "create_post_with_pool" } },
    options: { showEvents: true },
    limit: 50,
  });
  const { data: oldTxs } = useSuiClientQuery("queryTransactionBlocks", {
    filter: { MoveFunction: { package: OLD_PACKAGE_ID, module: "platform", function: "create_post" } },
    options: { showEvents: true },
    limit: 50,
  });
  const { data: oldStakedTxs } = useSuiClientQuery("queryTransactionBlocks", {
    filter: { MoveFunction: { package: OLD_PACKAGE_ID, module: "platform", function: "create_post_with_pool" } },
    options: { showEvents: true },
    limit: 50,
  });

  // R2E イベント（閲覧数の代理指標）
  const { data: readEvents } = useSuiClientQuery("queryEvents", {
    query: { MoveEventType: `${PACKAGE_ID}::platform::ReadRewardClaimed` },
    limit: 50,
  });

  // W2E イベント
  const { data: writeEvents } = useSuiClientQuery("queryEvents", {
    query: { MoveEventType: `${PACKAGE_ID}::platform::WritingRewardClaimed` },
    limit: 50,
  });

  // 著者の投稿IDを集める
  const authorPostIds = useMemo(() => {
    const ids = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractIds = (txData: any[] | undefined) => {
      if (!txData) return;
      for (const tx of txData) {
        if (!tx.events) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const ev of tx.events as any[]) {
          if (ev.type.includes("::platform::PostCreated") && ev.parsedJson?.author === address) {
            ids.add(ev.parsedJson.post_id);
          }
        }
      }
    };
    extractIds(newTxs?.data);
    extractIds(stakedTxs?.data);
    extractIds(oldTxs?.data);
    extractIds(oldStakedTxs?.data);
    return ids;
  }, [newTxs, stakedTxs, oldTxs, oldStakedTxs, address]);

  // 著者の投稿オブジェクトを取得（チップ合計計算用）
  const postIdArray = useMemo(() => [...authorPostIds], [authorPostIds]);
  const { data: postObjects } = useSuiClientQuery(
    "multiGetObjects",
    { ids: postIdArray, options: { showContent: true } },
    { enabled: postIdArray.length > 0 }
  );

  const stats = useMemo(() => {
    const postCount = authorPostIds.size;

    // 著者の記事に対する閲覧数
    let totalReaders = 0;
    if (readEvents?.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalReaders = readEvents.data.filter((e: any) =>
        authorPostIds.has(e.parsedJson?.post_id)
      ).length;
    }

    // W2E 受領額
    let writeEarnings = 0;
    if (writeEvents?.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      writeEarnings = writeEvents.data.filter((e: any) =>
        e.parsedJson?.author === address
      ).length * 0.1; // 0.1 SUI per claim
    }

    // チップ合計
    let totalTips = 0;
    if (postObjects) {
      for (const obj of postObjects) {
        if (!obj.data?.content) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tipBalance = Number((obj.data.content as any).fields?.tip_balance || 0);
        totalTips += tipBalance / 1e9;
      }
    }

    const totalEarnings = writeEarnings + totalTips;

    return { postCount, totalReaders, totalTips, writeEarnings, totalEarnings };
  }, [authorPostIds, readEvents, writeEvents, postObjects, address]);

  if (stats.postCount === 0) return null;

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
      <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Analytics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{stats.postCount}</p>
          <p className="text-gray-500 text-xs mt-1">Articles</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{stats.totalReaders}</p>
          <p className="text-gray-500 text-xs mt-1">Readers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-400">{stats.totalTips.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-1">Tips (SUI)</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{stats.totalEarnings.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-1">Total Earned (SUI)</p>
        </div>
      </div>
    </div>
  );
}
