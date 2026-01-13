/**
 * WalletConnect Client for Stacks Integration
 * Implements Stacks-specific JSON-RPC methods
 * https://docs.walletconnect.network/wallet-sdk/chain-support/stacks
 */

import { IWalletKit } from '@reown/walletkit';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { walletConnectConfig, type StacksNetwork, type WalletConnectSession } from './config';

export class StacksWalletConnect {
  private walletKit: IWalletKit | null = null;
  private activeSessions: Map<string, WalletConnectSession> = new Map();

  /**
   * Initialize WalletConnect WalletKit
   */
  async initialize(projectId?: string): Promise<void> {
    try {
      const { WalletKit } = await import('@reown/walletkit');
      const { Core } = await import('@walletconnect/core');

      const core = new Core({
        projectId: projectId || walletConnectConfig.projectId,
      });

      this.walletKit = await WalletKit.init({
        core,
        metadata: walletConnectConfig.metadata,
      });

      // Set up event listeners
      this.setupEventListeners();

      console.log('WalletConnect initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
      throw error;
    }
  }

  /**
   * Set up event listeners for WalletConnect sessions
   */
  private setupEventListeners(): void {
    if (!this.walletKit) return;

    // Session proposal
    this.walletKit.on('session_proposal', async (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      console.log('Session proposal received:', proposal);
      // Handle session proposal - approve or reject
    });

    // Session request
    this.walletKit.on('session_request', async (event: SignClientTypes.EventArguments['session_request']) => {
      console.log('Session request received:', event);
      await this.handleSessionRequest(event);
    });

    // Session delete
    this.walletKit.on('session_delete', (event: SignClientTypes.EventArguments['session_delete']) => {
      console.log('Session deleted:', event);
      this.activeSessions.delete(event.topic);
    });
  }

  /**
   * Pair with a dApp using WalletConnect URI
   */
  async pair(uri: string): Promise<void> {
    if (!this.walletKit) {
      throw new Error('WalletConnect not initialized');
    }

    await this.walletKit.core.pairing.pair({ uri });
  }

  /**
   * Approve a session proposal
   */
  async approveSession(
    proposal: SignClientTypes.EventArguments['session_proposal'],
    address: string,
    network: StacksNetwork = 'mainnet'
  ): Promise<void> {
    if (!this.walletKit) {
      throw new Error('WalletConnect not initialized');
    }

    const { id, params } = proposal;
    const chainId = `stacks:${network}`;

    const session = await this.walletKit.approveSession({
      id,
      namespaces: {
        stacks: {
          accounts: [`${chainId}:${address}`],
          methods: [
            'stx_getAddresses',
            'stx_transferStx',
            'stx_signTransaction',
            'stx_signMessage',
            'stx_signStructuredMessage',
            'stx_callContract',
          ],
          events: ['addressChanged', 'networkChanged'],
        },
      },
      sessionProperties: {
        stacks_getAddresses: JSON.stringify({
          addresses: [
            {
              symbol: 'STX',
              address,
            },
          ],
        }),
      },
    });

    this.activeSessions.set(session.topic, {
      topic: session.topic,
      addresses: [{ symbol: 'STX', address }],
      network,
    });

    console.log('Session approved:', session);
  }

  /**
   * Reject a session proposal
   */
  async rejectSession(proposal: SignClientTypes.EventArguments['session_proposal']): Promise<void> {
    if (!this.walletKit) {
      throw new Error('WalletConnect not initialized');
    }

    await this.walletKit.rejectSession({
      id: proposal.id,
      reason: getSdkError('USER_REJECTED'),
    });
  }

  /**
   * Handle session requests (RPC methods)
   */
  private async handleSessionRequest(event: SignClientTypes.EventArguments['session_request']): Promise<void> {
    if (!this.walletKit) return;

    const { topic, params, id } = event;
    const { request } = params;

    try {
      let result: any;

      switch (request.method) {
        case 'stx_getAddresses':
          result = await this.handleGetAddresses(topic);
          break;

        case 'stx_transferStx':
          result = await this.handleTransferStx(request.params);
          break;

        case 'stx_signTransaction':
          result = await this.handleSignTransaction(request.params);
          break;

        case 'stx_signMessage':
          result = await this.handleSignMessage(request.params);
          break;

        case 'stx_signStructuredMessage':
          result = await this.handleSignStructuredMessage(request.params);
          break;

        case 'stx_callContract':
          result = await this.handleCallContract(request.params);
          break;

        default:
          throw new Error(`Unsupported method: ${request.method}`);
      }

      // Send successful response
      await this.walletKit.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          result,
        },
      });
    } catch (error) {
      // Send error response
      await this.walletKit.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          error: {
            code: 5000,
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });
    }
  }

  /**
   * Get addresses for the current session
   */
  private async handleGetAddresses(topic: string): Promise<any> {
    const session = this.activeSessions.get(topic);
    if (!session) {
      throw new Error('Session not found');
    }

    return {
      addresses: session.addresses,
    };
  }

  /**
   * Handle STX transfer request
   * NOTE: This is a placeholder - implement actual wallet logic
   */
  private async handleTransferStx(params: any): Promise<any> {
    // Implement actual STX transfer logic here
    // This should interact with user's wallet to sign and broadcast transaction
    console.log('Transfer STX request:', params);
    
    throw new Error('Transfer STX not implemented - connect to your wallet implementation');
  }

  /**
   * Handle transaction signing request
   * NOTE: This is a placeholder - implement actual wallet logic
   */
  private async handleSignTransaction(params: any): Promise<any> {
    // Implement actual transaction signing logic here
    console.log('Sign transaction request:', params);
    
    throw new Error('Sign transaction not implemented - connect to your wallet implementation');
  }

  /**
   * Handle message signing request
   * NOTE: This is a placeholder - implement actual wallet logic
   */
  private async handleSignMessage(params: any): Promise<any> {
    // Implement actual message signing logic here
    console.log('Sign message request:', params);
    
    throw new Error('Sign message not implemented - connect to your wallet implementation');
  }

  /**
   * Handle structured message signing request
   * NOTE: This is a placeholder - implement actual wallet logic
   */
  private async handleSignStructuredMessage(params: any): Promise<any> {
    // Implement actual structured message signing logic here
    console.log('Sign structured message request:', params);
    
    throw new Error('Sign structured message not implemented - connect to your wallet implementation');
  }

  /**
   * Handle contract call request
   * NOTE: This is a placeholder - implement actual wallet logic
   */
  private async handleCallContract(params: any): Promise<any> {
    // Implement actual contract call logic here
    console.log('Call contract request:', params);
    
    throw new Error('Call contract not implemented - connect to your wallet implementation');
  }

  /**
   * Disconnect a session
   */
  async disconnectSession(topic: string): Promise<void> {
    if (!this.walletKit) {
      throw new Error('WalletConnect not initialized');
    }

    await this.walletKit.disconnectSession({
      topic,
      reason: getSdkError('USER_DISCONNECTED'),
    });

    this.activeSessions.delete(topic);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): WalletConnectSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Get WalletKit instance (for advanced usage)
   */
  getWalletKit(): IWalletKit | null {
    return this.walletKit;
  }
}

// Export a singleton instance
export const walletConnect = new StacksWalletConnect();
