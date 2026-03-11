import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sui Dev Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SUI_RPC = "https://fullnode.testnet.sui.io";

function decodeBytes(bytes: number[]): string {
  try {
    return Buffer.from(bytes).toString("utf-8");
  } catch {
    return "";
  }
}

function parseTitle(raw: string): { cleanTitle: string; tags: string[] } {
  const tagRegex = /\[([^\]]+)\]/g;
  const tags: string[] = [];
  let match;
  while ((match = tagRegex.exec(raw)) !== null) {
    tags.push(match[1]);
  }
  const cleanTitle = raw.replace(/\s*\[[^\]]+\]/g, "").trim();
  return { cleanTitle, tags };
}

async function fetchPostFields(id: string) {
  try {
    const res = await fetch(SUI_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getObject",
        params: [id, { showContent: true }],
      }),
    });
    const json = await res.json();
    return json?.result?.data?.content?.fields ?? null;
  } catch {
    return null;
  }
}

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fields = await fetchPostFields(id);

  let title = "Sui Dev Hub";
  let tags: string[] = [];
  let author = "";
  let isAI = false;

  if (fields?.title) {
    const raw = decodeBytes(fields.title);
    const parsed = parseTitle(raw);
    title = parsed.cleanTitle;
    tags = parsed.tags.filter((t) => t !== "AI");
    isAI = parsed.tags.includes("AI");
    if (fields.author) {
      author = `${fields.author.slice(0, 6)}...${fields.author.slice(-4)}`;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: Tags */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {isAI && (
            <div
              style={{
                background: "rgba(139, 92, 246, 0.3)",
                border: "1px solid rgba(139, 92, 246, 0.6)",
                borderRadius: "8px",
                padding: "6px 16px",
                color: "#c4b5fd",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              AI
            </div>
          )}
          {tags.slice(0, 4).map((tag) => (
            <div
              key={tag}
              style={{
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                borderRadius: "8px",
                padding: "6px 16px",
                color: "#93c5fd",
                fontSize: "20px",
              }}
            >
              #{tag}
            </div>
          ))}
        </div>

        {/* Center: Title */}
        <div
          style={{
            fontSize: title.length > 40 ? "42px" : "52px",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.3,
            maxHeight: "280px",
            overflow: "hidden",
          }}
        >
          {title}
        </div>

        {/* Bottom: Branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
                fontSize: "24px",
              }}
            >
              S
            </div>
            <div style={{ color: "white", fontSize: "28px", fontWeight: 700 }}>
              Sui Dev Hub
            </div>
          </div>
          {author && (
            <div style={{ color: "#9ca3af", fontSize: "22px" }}>
              by {author}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
