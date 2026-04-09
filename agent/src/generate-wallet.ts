/**
 * Generate Wallet — Create a testnet Stellar keypair for the agent
 *
 * Run: npx tsx agent/src/generate-wallet.ts
 * Copy the output into your .env as AGENT_PRIVATE_KEY
 */

import StellarSdk from '@stellar/stellar-sdk';

const keypair = StellarSdk.Keypair.generate();

console.log('');
console.log('================================================================');
console.log('  NEW STELLAR TESTNET WALLET');
console.log('================================================================');
console.log(`  Public Key (Address) : ${keypair.publicKey()}`);
console.log(`  Private Key (Secret) : ${keypair.secret()}`);
console.log('================================================================');
console.log('');
console.log('  Add to your .env:');
console.log(`  AGENT_PRIVATE_KEY=${keypair.secret()}`);
console.log('');
console.log('  Get testnet XLM from:');
console.log('  https://laboratory.stellar.org/');
console.log('');

