"use client";

import { useState, useRef } from "react";
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/lib/sui";
import { useZkLogin } from "@/context/ZkLoginContext";
import { zkLoginSponsoredSignAndExecute } from "@/lib/zklogin";

const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";

async function uploadToWalrus(content: string | File): Promise<string> {
  const res = await fetch(`${WALRUS_PUBLISHER}/v1/blobs?epochs=5`, {
    method: "PUT",
    body: content,
  });
  if (!res.ok) throw new Error("Walrus upload failed");
  const data = await res.json();
  return data.newlyCreated?.blobObject?.blobId ?? data.alreadyCertified?.blobId;
}

const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

export function CreatePost() {
  const account = useCurrentAccount();
  const { session } = useZkLogin();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute, isPending: walletPending } = useSignAndExecuteTransaction();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sponsoring, setSponsoring] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      const blobId = await uploadToWalrus(file);
      const imageUrl = `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`;
      const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
      setContent((prev) => prev + imageMarkdown);
    } catch (err) {
      setError(`画像のアップロードに失敗しました: ${String(err)}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSuccess = () => {
    setTitle("");
    setContent("");
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    if (!account && !session) return;
    setError("");

    let blobId: string;
    try {
      setUploading(true);
      blobId = await uploadToWalrus(content);
    } catch {
      setError("Walrusへのアップロードに失敗しました");
      setUploading(false);
      return;
    } finally {
      setUploading(false);
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::platform::create_post`,
      arguments: [
        tx.pure.string(title),
        tx.pure.string(blobId),
      ],
    });

    // zkLogin user: use sponsored transaction (gasless)
    if (session && !account) {
      try {
        setSponsoring(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await zkLoginSponsoredSignAndExecute(session, tx, suiClient as any);
        handleSuccess();
      } catch (err) {
        setError(`投稿に失敗しました: ${String(err)}`);
      } finally {
        setSponsoring(false);
      }
      return;
    }

    // Wallet user: use dapp-kit
    signAndExecute({ transaction: tx }, { onSuccess: handleSuccess });
  };

  const isPending = uploading || walletPending || sponsoring;

  const getButtonLabel = () => {
    if (uploading) return "Walrusにアップロード中...";
    if (sponsoring) return "ガス代スポンサー中...";
    if (walletPending) return "チェーンに保存中...";
    return "投稿する";
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <h2 className="text-lg font-semibold mb-4">記事を投稿</h2>
      {session && !account && (
        <p className="text-xs text-green-400 mb-3">✓ ガス代無料で投稿できます（スポンサー付き）</p>
      )}
      <input
        className="w-full bg-gray-800 rounded-lg px-4 py-2 mb-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full bg-gray-800 rounded-lg px-4 py-2 mb-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none"
        placeholder="本文（Markdown対応）"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex items-center gap-3 mb-4">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          📷 画像をアップロード
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !title || !content}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {getButtonLabel()}
        </button>
        {done && <span className="text-green-400 text-sm">投稿しました！</span>}
        {error && <span className="text-red-400 text-sm">{error}</span>}
      </div>
    </form>
  );
}
