/**
 * Example: WalletConnect Integration with Sentinel Protocol
 * 
 * This example demonstrates how to integrate WalletConnect with your Stacks dApp
 * to enable wallet connections and interact with the sentinel-protocol contract.
 */

import { 
  initializeWalletConnect, 
  connectDApp, 
  walletConnect,
  type StacksNetwork 
} from './walletconnect';

/**
 * Example 1: Initialize and Setup WalletConnect
 */
export async function setupWalletConnect(projectId: string) {
  console.log('🚀 Initializing WalletConnect...');
  
  await initializeWalletConnect(projectId);
  
  // Listen for session proposals (when dApp wants to connect)
  walletConnect.getWalletKit()?.on('session_proposal', async (proposal) => {
    console.log('📱 New connection request:');
    console.log('  dApp Name:', proposal.params.proposer.metadata.name);
    console.log('  dApp URL:', proposal.params.proposer.metadata.url);
    console.log('  Description:', proposal.params.proposer.metadata.description);
    
    // In a real app, show this to the user and ask for approval
    const userApproved = await promptUserForApproval(proposal);
    
    if (userApproved) {
      // Get user's Stacks address (from your wallet implementation)
      const userAddress = await getUserStacksAddress();
      const network: StacksNetwork = 'mainnet'; // or 'testnet', 'devnet'
      
      await walletConnect.approveSession(proposal, userAddress, network);
      console.log('✅ Session approved!');
    } else {
      await walletConnect.rejectSession(proposal);
      console.log('❌ Session rejected');
    }
  });
  
  console.log('✅ WalletConnect initialized and ready');
}

/**
 * Example 2: Connect to dApp via QR Code
 */
export async function connectViaqrCode(wcUri: string) {
  console.log('🔗 Connecting to dApp...');
  
  try {
    await connectDApp(wcUri);
    console.log('✅ Connection initiated - waiting for approval');
  } catch (error) {
    console.error('❌ Failed to connect:', error);
    throw error;
  }
}

/**
 * Example 3: Interact with Sentinel Protocol Contract via WalletConnect
 * 
 * This shows how a connected dApp might request to call your contract
 */
export async function exampleContractInteraction() {
  // When a dApp sends a contract call request, it will look like this:
  const exampleRequest = {
    id: 1,
    jsonrpc: '2.0',
    method: 'stx_callContract',
    params: {
      contract: 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX.sentinel-protocol',
      functionName: 'your-function-name',
      functionArgs: [],
    },
  };
  
  console.log('Example contract call request:', exampleRequest);
  
  // The WalletConnect client will automatically handle this request
  // and call your handleCallContract method
}

/**
 * Example 4: Handle STX Transfer Request
 */
export async function exampleStxTransfer() {
  // When a dApp requests an STX transfer, the request looks like:
  const exampleTransferRequest = {
    id: 1,
    jsonrpc: '2.0',
    method: 'stx_transferStx',
    params: {
      sender: 'SP3F7GQ48JY59521DZEE6KABHBF4Q33PEYJ823ZXQ',
      recipient: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      amount: '1000000', // 1 STX in micro-STX
      memo: 'Payment for service',
      network: 'mainnet',
    },
  };
  
  console.log('Example transfer request:', exampleTransferRequest);
  
  // Your wallet implementation should:
  // 1. Show transaction details to user
  // 2. Get user approval
  // 3. Sign the transaction
  // 4. Broadcast to network
  // 5. Return transaction ID
}

/**
 * Example 5: Sign a Message
 */
export async function exampleMessageSigning() {
  // Message signing request from dApp:
  const exampleSignRequest = {
    id: 1,
    jsonrpc: '2.0',
    method: 'stx_signMessage',
    params: {
      address: 'SP3F7GQ48JY59521DZEE6KABHBF4Q33PEYJ823ZXQ',
      message: 'Please sign this message to prove ownership',
      messageType: 'utf8',
      network: 'mainnet',
    },
  };
  
  console.log('Example sign message request:', exampleSignRequest);
  
  // Your wallet should sign the message and return the signature
}

/**
 * Example 6: View Active Sessions
 */
export function viewActiveSessions() {
  const sessions = walletConnect.getActiveSessions();
  
  console.log(`📊 Active Sessions: ${sessions.length}`);
  sessions.forEach((session, index) => {
    console.log(`\n  Session ${index + 1}:`);
    console.log(`    Topic: ${session.topic}`);
    console.log(`    Network: ${session.network}`);
    console.log(`    Addresses:`, session.addresses);
  });
  
  return sessions;
}

/**
 * Example 7: Disconnect from a Session
 */
export async function disconnectFromSession(sessionTopic: string) {
  console.log(`🔌 Disconnecting session: ${sessionTopic}`);
  
  try {
    await walletConnect.disconnectSession(sessionTopic);
    console.log('✅ Session disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect:', error);
    throw error;
  }
}

/**
 * Complete Example: Full Workflow
 */
export async function completeExample() {
  console.log('='.repeat(60));
  console.log('WalletConnect + Sentinel Protocol - Complete Example');
  console.log('='.repeat(60));
  
  // Step 1: Initialize
  const projectId = process.env.WALLETCONNECT_PROJECT_ID || 'your-project-id';
  await setupWalletConnect(projectId);
  
  // Step 2: Connect to a dApp (typically from QR code scan)
  // const wcUri = 'wc:...'; // You would get this from scanning QR
  // await connectViaQRCode(wcUri);
  
  // Step 3: View active sessions
  const sessions = viewActiveSessions();
  
  // Step 4: Handle various requests (automatic via event listeners)
  // - Contract calls
  // - Transfers
  // - Message signing
  
  // Step 5: Disconnect when done
  // if (sessions.length > 0) {
  //   await disconnectFromSession(sessions[0].topic);
  // }
  
  console.log('\n✅ Example complete!');
}

// Helper functions (you need to implement these)

async function promptUserForApproval(proposal: any): Promise<boolean> {
  // TODO: Implement UI to show proposal to user and get approval
  // For now, auto-approve (not recommended for production!)
  console.log('⚠️  Auto-approving (implement proper UI for production)');
  return true;
}

async function getUserStacksAddress(): Promise<string> {
  // TODO: Get address from your wallet implementation
  // This is just a placeholder
  return 'SP3F7GQ48JY59521DZEE6KABHBF4Q33PEYJ823ZXQ';
}

// Run example if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  completeExample().catch(console.error);
}
