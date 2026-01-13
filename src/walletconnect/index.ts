/**
 * WalletConnect Integration Utilities
 * Helper functions for Stacks integration
 */

import { walletConnect } from './client';
import type { StacksNetwork } from './config';

/**
 * Initialize WalletConnect with project ID
 * Get your project ID from: https://cloud.walletconnect.com
 */
export async function initializeWalletConnect(projectId: string): Promise<void> {
  await walletConnect.initialize(projectId);
}

/**
 * Connect to a dApp using WalletConnect URI
 * Typically obtained by scanning a QR code or deep link
 */
export async function connectDApp(uri: string): Promise<void> {
  await walletConnect.pair(uri);
}

/**
 * Disconnect from a specific session
 */
export async function disconnect(topic: string): Promise<void> {
  await walletConnect.disconnectSession(topic);
}

/**
 * Get all active WalletConnect sessions
 */
export function getActiveSessions() {
  return walletConnect.getActiveSessions();
}

/**
 * Utility to validate Stacks address format
 */
export function isValidStacksAddress(address: string, network: StacksNetwork = 'mainnet'): boolean {
  // Mainnet addresses start with SP, testnet with ST
  const prefix = network === 'mainnet' ? 'SP' : 'ST';
  return address.startsWith(prefix) && address.length === 41;
}

/**
 * Format micro-STX to STX (1 STX = 1,000,000 micro-STX)
 */
export function microStxToStx(microStx: string | number): number {
  const amount = typeof microStx === 'string' ? parseInt(microStx, 10) : microStx;
  return amount / 1_000_000;
}

/**
 * Format STX to micro-STX
 */
export function stxToMicroStx(stx: number): string {
  return (stx * 1_000_000).toString();
}

// Export the main client
export { walletConnect };
export * from './config';
export * from './client';
export * from './contract';
