import { NextRequest, NextResponse } from "next/server";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

const client = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl("testnet") });

export async function POST(req: NextRequest) {
  try {
    const { txKindBytes, sender } = await req.json();

    if (!process.env.SPONSOR_PRIVATE_KEY) {
      return NextResponse.json({ error: "Sponsor not configured" }, { status: 500 });
    }

    const sponsorKeypair = Ed25519Keypair.fromSecretKey(process.env.SPONSOR_PRIVATE_KEY);
    const sponsorAddress = sponsorKeypair.getPublicKey().toSuiAddress();

    // Reconstruct transaction from kind bytes
    const kindBytes = new Uint8Array(Buffer.from(txKindBytes, "base64"));
    const tx = Transaction.fromKind(kindBytes);
    tx.setSender(sender);
    tx.setGasOwner(sponsorAddress);

    // Get sponsor's coins for gas
    const coins = await client.getCoins({ owner: sponsorAddress });
    if (!coins.data.length) {
      return NextResponse.json({ error: "Sponsor wallet has no SUI. Fund: " + sponsorAddress }, { status: 500 });
    }

    tx.setGasPayment(
      coins.data.slice(0, 1).map((c) => ({
        objectId: c.coinObjectId,
        version: c.version,
        digest: c.digest,
      }))
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builtTxBytes = await tx.build({ client: client as any });
    const { signature: sponsorSignature } = await sponsorKeypair.signTransaction(builtTxBytes);

    return NextResponse.json({
      txBytes: Buffer.from(builtTxBytes).toString("base64"),
      sponsorSignature,
    });
  } catch (e) {
    console.error("Sponsor API error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
