// Run: node scripts/generate-sponsor.mjs
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

const keypair = new Ed25519Keypair();
const address = keypair.getPublicKey().toSuiAddress();
const privateKey = keypair.getSecretKey();

console.log("=== Sponsor Wallet Generated ===");
console.log("Address:", address);
console.log("Private Key (SPONSOR_PRIVATE_KEY):", privateKey);
console.log("");
console.log("Next steps:");
console.log("1. Add to Vercel env: SPONSOR_PRIVATE_KEY =", privateKey);
console.log("2. Fund with testnet SUI: https://faucet.sui.io/?address=" + address);
