"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, TJPYC_COIN_TYPE } from "@/lib/sui";
import { useZkLogin } from "@/context/ZkLoginContext";
import { zkLoginSponsoredSignAndExecute } from "@/lib/zklogin";

// PremiumBadge shown on post card when the article is premium
export function PremiumBadge({ price }: { price: number }) {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-950/60 border border-amber-700/50 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
      🔒 <span className="shimmer">{price} 円 Premium</span>
    </span>
  );
}

// Button author clicks on post detail page to enable premium
export function LockAsPremiumButton({ postId, onSuccess }: { postId: string; onSuccess?: () => void }) {
  const account = useCurrentAccount();
  const { session } = useZkLogin();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute, isPending: walletPending } = useSignAndExecuteTransaction();
  const [priceInput, setPriceInput] = useState("0.5");
  const [zkPending, setZkPending] = useState(false);
  const [done, setDone] = useState(false);
  const isPending = walletPending || zkPending;

  const handleLock = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Math.round(parseFloat(priceInput) * 1_000_000_000); // 9 decimals like SUI/TJPYC
    if (!price || price <= 0) return;

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::platform::lock_as_premium_token`,
      typeArguments: [TJPYC_COIN_TYPE],
      arguments: [
        tx.object(postId),
        tx.pure.u64(price),
      ],
    });

    if (session && !account) {
      try {
        setZkPending(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await zkLoginSponsoredSignAndExecute(session, tx, suiClient as any);
        setDone(true);
        onSuccess?.();
      } finally {
        setZkPending(false);
      }
      return;
    }
    if (account) {
      signAndExecute({ transaction: tx }, {
        onSuccess: () => { setDone(true); onSuccess?.(); },
      });
    }
  };

  if (done) {
    return (
      <div className="bg-amber-950/30 border border-amber-700/50 rounded-xl p-4 text-center">
        <p className="text-amber-300 font-semibold">🔒 プレミアム設定完了！</p>
        <p className="text-gray-400 text-xs mt-1">読者は {priceInput} 円 (TJPYC) を支払って記事を読むことができます</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLock} className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4">
      <p className="text-amber-300 font-semibold text-sm mb-2">🔒 有料記事にする (TJPYC決済)</p>
      <p className="text-gray-400 text-xs mb-3">価格を設定すると、読者はTJPYC（テスト日本円）を支払って記事全文を読めます。支払いは即座にあなたのウォレットに届きます。</p>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="number"
            step="100"
            min="100"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">円</span>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
        >
          {isPending ? "設定中..." : "有料化する"}
        </button>
      </div>
    </form>
  );
}

// Button reader clicks to pay and unlock premium content
export function UnlockPremiumButton({
  postId,
  configId,
  priceMist,
  onUnlocked,
}: {
  postId: string;
  configId: string;
  priceMist: number;
  onUnlocked: () => void;
}) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const priceSui = (priceMist / 1_000_000_000).toFixed(1);

  const handleUnlock = async () => {
    if (!account) return;
    
    // Fetch TJPYC coins to pay
    const coins = await suiClient.getCoins({
      owner: account.address,
      coinType: TJPYC_COIN_TYPE,
    });
    
    const validCoins = coins.data;
    if (validCoins.length === 0) {
      alert("TJPYCが不足しています。上の「蛇口」ボタンから取得してください。");
      return;
    }

    const tx = new Transaction();
    
    // We need to merge multiple coins into one, or just take the first if it's large enough for simplicity.
    // For robust implementation, merge them.
    let paymentCoinId;
    if (validCoins.length > 1) {
      const primaryCoin = tx.object(validCoins[0].coinObjectId);
      const restCoins = validCoins.slice(1).map(c => tx.object(c.coinObjectId));
      tx.mergeCoins(primaryCoin, restCoins);
      paymentCoinId = primaryCoin;
    } else {
      paymentCoinId = tx.object(validCoins[0].coinObjectId);
    }
    
    // Split the exact amount needed for payment
    const [paymentCoin] = tx.splitCoins(paymentCoinId, [tx.pure.u64(priceMist)]);

    tx.moveCall({
      target: `${PACKAGE_ID}::platform::unlock_premium_token`,
      typeArguments: [TJPYC_COIN_TYPE],
      arguments: [tx.object(configId), paymentCoin],
    });
    
    signAndExecute({ transaction: tx }, { onSuccess: onUnlocked });
  };

  if (!account) return (
    <p className="text-gray-500 text-sm text-center py-4">ウォレットを接続して記事を購入してください</p>
  );

  return (
    <div className="relative">
      {/* Blurred preview overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent z-10 flex flex-col items-center justify-end pb-8 gap-4">
        <div className="text-center">
          <p className="text-white font-bold text-lg">🔒 プレミアムコンテンツ</p>
          <p className="text-gray-400 text-sm">この記事の続きを読むには {priceSui} 円 (TJPYC) が必要です</p>
        </div>
        <button
          onClick={handleUnlock}
          disabled={isPending}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all btn-glow shadow-lg"
        >
          {isPending ? "購入中..." : `${priceSui} 円 (TJPYC) で解除する`}
        </button>
      </div>
      {/* Blurred content preview */}
      <div className="blur-sm opacity-40 pointer-events-none h-32 overflow-hidden">
        <p className="text-gray-300 text-sm">プレミアムコンテンツがここに表示されます...</p>
      </div>
    </div>
  );
}
