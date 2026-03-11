// 共通ユーティリティ関数
// PostList, PostDetail, profile.ts 等で共有

export function decodeBytes(bytes: number[]): string {
  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return "";
  }
}

export function shortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// "My Title [Move][Sui][AI]" → { cleanTitle: "My Title", tags: ["Move", "Sui", "AI"] }
export function parseTitle(rawTitle: string): { cleanTitle: string; tags: string[] } {
  const tagRegex = /\[([^\]]+)\]/g;
  const tags: string[] = [];
  let match;
  while ((match = tagRegex.exec(rawTitle)) !== null) {
    tags.push(match[1]);
  }
  const cleanTitle = rawTitle.replace(/\s*\[[^\]]+\]/g, "").trim();
  return { cleanTitle, tags };
}

// 読了時間を推定（日本語: 400字/分、英語: 200語/分）
export function estimateReadingTime(content: string): number {
  // 日本語文字数をカウント（CJK統合漢字、ひらがな、カタカナ）
  const japaneseChars = (content.match(/[\u3000-\u9fff\uff00-\uffef]/g) || []).length;
  // 英語の単語数をカウント（日本語文字を除いたラテン文字列）
  const latinText = content.replace(/[\u3000-\u9fff\uff00-\uffef]/g, " ");
  const englishWords = latinText.split(/\s+/).filter((w) => w.length > 0).length;

  const minutes = japaneseChars / 400 + englishWords / 200;
  return Math.max(1, Math.ceil(minutes));
}
