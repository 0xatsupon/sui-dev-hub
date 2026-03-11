import type { MetadataRoute } from "next";

const SUI_RPC = "https://fullnode.testnet.sui.io";
const PACKAGE_ID = "0xdd43cda8c795135ce73a55f6ebdff3dabdec5a816d03b8ab363e2cc291752017";
const OLD_PACKAGE_ID = "0x0ff874ccde9a069bd6506d71eefb44d420215ce39ae168fa8dbe2364a8a60b1a";

async function fetchPostIds(): Promise<string[]> {
  try {
    const fetchTxs = async (pkg: string, fn: string) => {
      const res = await fetch(SUI_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "suix_queryTransactionBlocks",
          params: [
            { filter: { MoveFunction: { package: pkg, module: "platform", function: fn } }, options: { showEvents: true } },
            null,
            50,
            true,
          ],
        }),
        next: { revalidate: 3600 },
      });
      const json = await res.json();
      return json?.result?.data ?? [];
    };

    const [newTxs, stakedTxs, oldTxs, oldStakedTxs, deleteTxs, oldDeleteTxs] = await Promise.all([
      fetchTxs(PACKAGE_ID, "create_post"),
      fetchTxs(PACKAGE_ID, "create_post_with_pool"),
      fetchTxs(OLD_PACKAGE_ID, "create_post"),
      fetchTxs(OLD_PACKAGE_ID, "create_post_with_pool"),
      fetchTxs(PACKAGE_ID, "delete_post"),
      fetchTxs(OLD_PACKAGE_ID, "delete_post"),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractIds = (txs: any[], eventSuffix: string) => {
      const ids: string[] = [];
      for (const tx of txs) {
        if (tx.events) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const ev of tx.events as any[]) {
            if (ev.type.includes(eventSuffix) && ev.parsedJson?.post_id) {
              ids.push(ev.parsedJson.post_id);
            }
          }
        }
      }
      return ids;
    };

    const createdIds = [
      ...extractIds(newTxs, "::platform::PostCreated"),
      ...extractIds(stakedTxs, "::platform::PostCreated"),
      ...extractIds(oldTxs, "::platform::PostCreated"),
      ...extractIds(oldStakedTxs, "::platform::PostCreated"),
    ];
    const deletedIds = new Set([
      ...extractIds(deleteTxs, "::platform::PostDeleted"),
      ...extractIds(oldDeleteTxs, "::platform::PostDeleted"),
    ]);

    return [...new Set(createdIds)].filter((id) => !deletedIds.has(id));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sui-dev-hub-tau.vercel.app";
  const postIds = await fetchPostIds();

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/create`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...postIds.map((id) => ({
      url: `${baseUrl}/post/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
