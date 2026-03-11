import { Metadata } from "next";
import PostDetail from "@/components/PostDetail";
import { decodeBytes, parseTitle } from "@/lib/utils";

const SUI_RPC = "https://fullnode.testnet.sui.io";

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
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return json?.result?.data?.content?.fields ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const fields = await fetchPostFields(id);

  if (fields?.title) {
    const rawTitle = decodeBytes(fields.title);
    const { cleanTitle: title, tags } = parseTitle(rawTitle);
    const tagStr = tags.filter((t) => t !== "AI").map((t) => `#${t}`).join(" ");
    const desc = tagStr ? `${title} — ${tagStr}` : `Sui Dev Hubの技術記事 — ${title}`;

    return {
      title: `${title} | Sui Dev Hub`,
      description: desc,
      openGraph: {
        title: `${title} | Sui Dev Hub`,
        description: desc,
        type: "article",
        siteName: "Sui Dev Hub",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Sui Dev Hub`,
        description: desc,
      },
    };
  }

  return {
    title: "記事 | Sui Dev Hub",
    description: "Sui Dev Hubの技術記事",
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fields = await fetchPostFields(id);

  let jsonLd = null;
  if (fields?.title) {
    const rawTitle = decodeBytes(fields.title);
    const { cleanTitle: title } = parseTitle(rawTitle);
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      author: {
        "@type": "Person",
        name: fields.author ? `${fields.author.slice(0, 6)}...${fields.author.slice(-4)}` : "Anonymous",
      },
      publisher: {
        "@type": "Organization",
        name: "Sui Dev Hub",
        url: "https://sui-dev-hub-tau.vercel.app",
      },
      url: `https://sui-dev-hub-tau.vercel.app/post/${id}`,
      isAccessibleForFree: true,
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PostDetail id={id} />
    </>
  );
}
