/**
 * Sentinel Protocol Contract Integration with WalletConnect
 * Deployed at: SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX.sentinel-protocol
 */

import { walletConnectConfig } from './config';

/**
 * Deployed contract details
 */
export const SENTINEL_CONTRACT = {
  address: 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX.sentinel-protocol',
  mainnet: 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX.sentinel-protocol',
  network: 'mainnet' as const,
};

/**
 * Helper to build contract identifier for WalletConnect requests
 */
export function getContractIdentifier(network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet'): string {
  if (network === 'mainnet') {
    return SENTINEL_CONTRACT.mainnet;
  }
  // For testnet/devnet, you would deploy and add those addresses here
  throw new Error(`Contract not deployed on ${network}`);
}

/**
 * Example: Call a read-only function on the sentinel-protocol contract
 */
export function buildReadOnlyCall(functionName: string, functionArgs: string[] = []) {
  return {
    contract: SENTINEL_CONTRACT.address,
    functionName,
    functionArgs,
  };
}

/**
 * Example: Call a public function on the sentinel-protocol contract
 * This requires signing and broadcasting a transaction
 */
export function buildContractCall(functionName: string, functionArgs: string[] = []) {
  return {
    method: 'stx_callContract',
    params: {
      contract: SENTINEL_CONTRACT.address,
      functionName,
      functionArgs,
    },
  };
}

/**
 * Example usage for specific contract functions
 * Update these based on your actual contract functions
 */

export const ContractCalls = {
  /**
   * Example: Call a hypothetical "register" function
   */
  register: (args: string[]) => buildContractCall('register', args),

  /**
   * Example: Call a hypothetical "update-status" function
   */
  updateStatus: (status: string) => buildContractCall('update-status', [status]),

  /**
   * Example: Read-only call to check status
   */
  getStatus: (address: string) => buildReadOnlyCall('get-status', [address]),
};

/**
 * Example: Interact with deployed contract via WalletConnect
 */
export async function callSentinelContract(
  walletKit: any,
  sessionTopic: string,
  functionName: string,
  functionArgs: string[] = []
) {
  const request = buildContractCall(functionName, functionArgs);

  return await walletKit.request({
    topic: sessionTopic,
    chainId: 'stacks:mainnet',
    request: {
      method: request.method,
      params: request.params,
    },
  });
}
