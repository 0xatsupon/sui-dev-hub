"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { processOAuthCallback } from "@/lib/zklogin";
import { useZkLogin } from "@/context/ZkLoginContext";

export default function AuthPage() {
  const router = useRouter();
  const { setSession } = useZkLogin();
  const [status, setStatus] = useState("処理中...");
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const jwt = params.get("id_token");

    if (!jwt) {
      setTimeout(() => setStatus("エラー: JWTが見つかりません"), 0);
      setTimeout(() => router.push("/"), 2000);
      return;
    }

    processOAuthCallback(jwt)
      .then((session) => {
        setSession(session);
        setTimeout(() => setStatus("ログイン完了！リダイレクト中..."), 0);
        setTimeout(() => router.push("/"), 1000);
      })
      .catch((err) => {
        console.error(err);
        setTimeout(() => setStatus(`エラー: ${err.message}`), 0);
        setTimeout(() => router.push("/"), 3000);
      });
  }, [router, setSession]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">{status}</div>
    </div>
  );
}
