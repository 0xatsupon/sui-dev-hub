"use client";

import { useState, useEffect } from "react";
import {
  useSuiClient,
  useSignAndExecuteTransaction,
  useCurrentAccount,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, REWARD_POOL_ID } from "@/lib/sui";
import { useZkLogin } from "@/context/ZkLoginContext";
import { zkLoginSponsoredSignAndExecute } from "@/lib/zklogin";

export default function ReadToEarnButton({ postId }: { postId: string }) {
  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const { session } = useZkLogin();
  const { mutate: signAndExecute, isPending: walletPending } =
    useSignAndExecuteTransaction();
  const [zkPending, setZkPending] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [poolEmpty, setPoolEmpty] = useState(false);
  const [error, setError] = useState("");
  const isPending = walletPending || zkPending;

  const currentAddress =
    account?.address ?? (session && !account ? session.address : null);

  // ReadRewardClaimed イベントで受け取り済みか確認
  const { data: claimEvents } = useSuiClientQuery(
    "queryEvents",
    {
      query: {
        MoveEventType: `${PACKAGE_ID}::platform::ReadRewardClaimed`,
      },
      limit: 50,
      order: "descending",
    },
    { enabled: !!currentAddress && !!postId }
  );

  useEffect(() => {
    if (!claimEvents || !currentAddress) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const alreadyClaimed = claimEvents.data.some((e: any) => {
      const j = e.parsedJson;
      return j?.post_id === postId && j?.claimer === currentAddress;
    });
    if (alreadyClaimed) setClaimed(true);
  }, [claimEvents, currentAddress, postId]);

  // RewardPool 残高チェック
  const { data: poolData } = useSuiClientQuery(
    "getObject",
    { id: REWARD_POOL_ID, options: { showContent: true } },
    { enabled: !!REWARD_POOL_ID }
  );

  useEffect(() => {
    if (!poolData?.data) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields = (poolData.data.content as any)?.fields;
    const raw = fields?.balance;
    const balanceMist = Number(
      typeof raw === "object" ? raw?.fields?.value ?? 0 : raw ?? 0
    );
    setPoolEmpty(balanceMist < 50_000_000);
  }, [poolData]);

  if (!currentAddress) return null;
  if (!REWARD_POOL_ID) return null;

  const handleClaim = async () => {
    if (claimed || isPending || poolEmpty) return;
    setError("");

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::platform::claim_reading_reward`,
      arguments: [tx.object(REWARD_POOL_ID), tx.object(postId)],
    });

    if (session && !account) {
      try {
        setZkPending(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await zkLoginSponsoredSignAndExecute(session, tx, suiClient as any);
        setClaimed(true);
      } catch (err) {
        setError(`エラー: ${String(err)}`);
      } finally {
        setZkPending(false);
      }
      return;
    }

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => setClaimed(true),
        onError: (err) => setError(`エラー: ${err.message}`),
      }
    );
  };

  return (
    <div className="mt-6 mb-2 p-4 rounded-xl border border-orange-800/50 bg-orange-950/20">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-orange-300 font-semibold text-sm mb-0.5">
            Read-to-Earn
          </p>
          <p className="text-gray-400 text-xs">
            この記事を読んだ報酬として{" "}
            <span className="text-orange-400 font-bold">0.05 SUI</span>{" "}
            を受け取れます
          </p>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        <button
          onClick={handleClaim}
          disabled={claimed || isPending || poolEmpty}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all
            ${
              claimed
                ? "bg-green-900/40 text-green-400 border border-green-700/50 cursor-default"
                : poolEmpty
                ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                : isPending
                ? "bg-orange-700/30 text-orange-400 border border-orange-700/50 opacity-70 cursor-wait"
                : "bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-600/40 hover:border-orange-500/60 active:scale-95"
            }
          `}
        >
          {claimed ? (
            <>報酬受け取り済み</>
          ) : isPending ? (
            <>処理中...</>
          ) : poolEmpty ? (
            <>プール残高不足</>
          ) : (
            <>読了報酬を受け取る</>
          )}
        </button>
      </div>
    </div>
  );
}
