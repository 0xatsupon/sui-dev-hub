"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { CreatePost } from "@/components/CreatePost";
import { ZkLoginButton } from "@/components/ZkLoginButton";
import { ProfileEditor } from "@/components/ProfileEditor";
import { useZkLogin } from "@/context/ZkLoginContext";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const account = useCurrentAccount();
  const { session } = useZkLogin();
  const router = useRouter();

  const canPost = account || session;

  return (
    <div className="min-h-screen pb-20">
      {/* Header / Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 py-3">
        <div className="max-w-3xl mx-auto px-4 flex justify-between items-center">
          <button 
            onClick={() => router.push("/")} 
            className="text-white hover:opacity-80 transition-opacity font-bold flex items-center gap-2"
          >
            <span className="text-xl">←</span> トップへ戻る
          </button>
          <div className="flex items-center gap-2">
            <ZkLoginButton />
            <ConnectButton />
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">記事を書く</h1>
          <p className="text-gray-400 text-sm">WalrusとSuiを使って、完全に分散化された記事を公開しましょう。</p>
        </div>

        {canPost ? (
          <div className="space-y-6">
            <ProfileEditor />
            <CreatePost />
          </div>
        ) : (
          <div className="glass rounded-2xl p-10 text-center border border-blue-800/30">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-xl font-bold text-white mb-2">ログインが必要です</h2>
            <p className="text-gray-400 text-sm mb-6">記事を投稿するには、Suiウォレットを接続するか Google アカウントでログインしてください。</p>
            <div className="flex justify-center gap-4">
              <ZkLoginButton />
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
