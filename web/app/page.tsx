"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { CreatePost } from "@/components/CreatePost";
import { PostList } from "@/components/PostList";
import { ZkLoginButton } from "@/components/ZkLoginButton";
import { ProfileEditor } from "@/components/ProfileEditor";
import { useZkLogin } from "@/context/ZkLoginContext";

export default function Home() {
  const account = useCurrentAccount();
  const { session } = useZkLogin();

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

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: "On-chain", value: "100%", sub: "decentralized" },
            { label: "Storage", value: "Walrus", sub: "Sui native" },
            { label: "Gas", value: "Free*", sub: "via sponsor" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center card-hover">
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Post creation panel */}
        {canPost && (
          <div className="space-y-4 mb-10">
            <ProfileEditor />
            <CreatePost />
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
        <div className="max-w-3xl mx-auto px-4 text-center text-gray-600 text-xs">
          <p>Built on Sui Blockchain · Powered by Walrus · Open Source</p>
          <p className="mt-1">*Gasless transactions sponsored via Enoki</p>
        </div>
      </footer>
    </div>
  );
}
