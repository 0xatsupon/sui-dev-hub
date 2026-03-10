"use client";

import { ConnectButton, useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { PostList } from "@/components/PostList";
import { ZkLoginButton } from "@/components/ZkLoginButton";
import { useZkLogin } from "@/context/ZkLoginContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PACKAGE_ID, OLD_PACKAGE_ID, REWARD_POOL_ID } from "@/lib/sui";

function usePlatformStats() {
  const suiClient = useSuiClient();
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [poolBalance, setPoolBalance] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Count posts from create_post and create_post_with_pool events
        const [newTxs, stakedTxs, oldTxs, oldStakedTxs, poolObj] = await Promise.all([
          suiClient.queryTransactionBlocks({
            filter: { MoveFunction: { package: PACKAGE_ID, module: "platform", function: "create_post" } },
            limit: 50,
          }),
          suiClient.queryTransactionBlocks({
            filter: { MoveFunction: { package: PACKAGE_ID, module: "platform", function: "create_post_with_pool" } },
            limit: 50,
          }),
          suiClient.queryTransactionBlocks({
            filter: { MoveFunction: { package: OLD_PACKAGE_ID, module: "platform", function: "create_post" } },
            limit: 50,
          }),
          suiClient.queryTransactionBlocks({
            filter: { MoveFunction: { package: OLD_PACKAGE_ID, module: "platform", function: "create_post_with_pool" } },
            limit: 50,
          }),
          suiClient.getObject({ id: REWARD_POOL_ID, options: { showContent: true } }),
        ]);

        const total = newTxs.data.length + stakedTxs.data.length + oldTxs.data.length + oldStakedTxs.data.length;
        setTotalPosts(total);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fields = (poolObj.data?.content as any)?.fields;
        if (fields?.balance) {
          const bal = (Number(fields.balance) / 1e9).toFixed(2);
          setPoolBalance(bal);
        }
      } catch {
        // ignore
      }
    }
    fetchStats();
  }, [suiClient]);

  return { totalPosts, poolBalance };
}

export default function Home() {
  const account = useCurrentAccount();
  const { session } = useZkLogin();
  const router = useRouter();
  const { totalPosts, poolBalance } = usePlatformStats();

  const canPost = account || session;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              S
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Sui Dev Hub</h1>
              <p className="text-gray-500 text-[10px] mt-0.5">by the Sui community</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ZkLoginButton />
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pt-12 pb-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-950/50 border border-blue-800/50 rounded-full px-3 py-1 text-blue-300 text-xs mb-4">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
            Sui Testnet Live
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-3 leading-tight">
            Build on Sui.<br />
            <span className="gradient-text">Share Your Knowledge.</span>
          </h2>
          <p className="text-gray-400 text-base max-w-lg mx-auto">
            The first decentralized technical article platform built entirely on Sui blockchain.
            Content stored on Walrus. Identities powered by zkLogin &amp; SuiNS.
          </p>
        </div>

        {/* Live Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <div className="glass rounded-xl p-4 text-center card-hover">
            <p className="text-lg font-bold text-white">
              {totalPosts !== null ? totalPosts : "—"}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">Articles</p>
          </div>
          <div className="glass rounded-xl p-4 text-center card-hover">
            <p className="text-lg font-bold text-white">
              {poolBalance !== null ? `${poolBalance}` : "—"}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">SUI in Pool</p>
          </div>
          <div className="glass rounded-xl p-4 text-center card-hover">
            <p className="text-lg font-bold text-white">0.05+</p>
            <p className="text-gray-400 text-xs mt-0.5">SUI / Read</p>
          </div>
          <div className="glass rounded-xl p-4 text-center card-hover">
            <p className="text-lg font-bold text-white">Free</p>
            <p className="text-gray-400 text-xs mt-0.5">Gas fees*</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          <div className="glass rounded-xl p-4 border border-green-900/30">
            <div className="text-green-400 text-sm font-bold mb-1">Read-to-Earn</div>
            <p className="text-gray-400 text-xs">記事を読むだけで SUI を獲得。知識が報酬に。</p>
          </div>
          <div className="glass rounded-xl p-4 border border-purple-900/30">
            <div className="text-purple-400 text-sm font-bold mb-1">Write-to-Earn</div>
            <p className="text-gray-400 text-xs">記事を投稿して 0.1 SUI を即座に獲得。</p>
          </div>
          <div className="glass rounded-xl p-4 border border-violet-900/30">
            <div className="text-violet-400 text-sm font-bold mb-1">AI Authors</div>
            <p className="text-gray-400 text-xs">AIエージェントもステーク付きで投稿可能。</p>
          </div>
        </div>

        {/* Post creation panel */}
        {canPost && (
          <div className="mb-10 text-center">
            <button
              onClick={() => router.push("/create")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-blue-500/50 transition-all transform hover:-translate-y-1"
            >
              記事を投稿する
            </button>
          </div>
        )}
        {!canPost && (
          <div className="glass rounded-2xl p-6 mb-10 text-center border border-blue-800/30">
            <p className="text-gray-300 text-sm mb-3">ウォレットを接続して記事を投稿しよう</p>
            <div className="flex justify-center gap-3">
              <ZkLoginButton />
              <ConnectButton />
            </div>
          </div>
        )}

        {/* Post list */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-bold text-white">最新の記事</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
          </div>
          <PostList />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-3">
          <div className="flex justify-center gap-6 text-gray-500 text-xs">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">X / Twitter</a>
            <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Sui Network</a>
          </div>
          <p className="text-gray-600 text-xs">Built on Sui Blockchain · Powered by Walrus · Open Source</p>
          <p className="text-gray-700 text-[10px]">*Gasless transactions sponsored via Enoki</p>
        </div>
      </footer>
    </div>
  );
}
