/**
 * Solana blockchain integration for the Quran reading app
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
  TransactionInstruction,
  AccountInfo,
  ParsedAccountData,
  TokenAmount
} from '@solana/web3.js';

import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getMint,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError
} from '@solana/spl-token';

// Solana Network Configuration
export interface SolanaConfig {
  network: 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';
  rpcUrl: string;
  programId: string;
  tokenMint: string;
  adminWallet?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

// Transaction Types
export interface TransferParams {
  fromWallet: string;
  toWallet: string;
  amount: number;
  decimals?: number;
}

export interface StakeParams {
  userWallet: string;
  amount: number;
  duration: number; // in days
}

export interface WithdrawalParams {
  userWallet: string;
  adminWallet: string;
  amount: number;
  signature: string;
}

export interface TokenBalance {
  address: string;
  balance: number;
  decimals: number;
  uiAmount: number;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
  blockTime?: number;
  slot?: number;
  confirmations?: number;
}

// Solana Client Class
export class SolanaClient {
  private connection: Connection;
  private config: SolanaConfig;
  private programId: PublicKey;
  private tokenMint: PublicKey;

  constructor(config: SolanaConfig) {
    this.config = config;
    this.connection = new Connection(config.rpcUrl, config.commitment || 'confirmed');
    this.programId = new PublicKey(config.programId);
    this.tokenMint = new PublicKey(config.tokenMint);
  }

  // Connection Methods
  async getConnection(): Promise<Connection> {
    return this.connection;
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.connection.getVersion();
      return true;
    } catch {
      return false;
    }
  }

  async getNetworkInfo(): Promise<{
    version: any;
    cluster: string;
    epochInfo: any;
  }> {
    const [version, epochInfo] = await Promise.all([
      this.connection.getVersion(),
      this.connection.getEpochInfo()
    ]);

    return {
      version,
      cluster: this.config.network,
      epochInfo
    };
  }

  // Wallet Methods
  async getWalletBalance(walletAddress: string): Promise<{
    solBalance: number;
    tokenBalance: TokenBalance | null;
  }> {
    const publicKey = new PublicKey(walletAddress);

    // Get SOL balance
    const solBalance = await this.connection.getBalance(publicKey);

    // Get token balance
    let tokenBalance: TokenBalance | null = null;
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        this.tokenMint,
        publicKey
      );

      const accountInfo = await getAccount(this.connection, tokenAccount);
      const mintInfo = await getMint(this.connection, this.tokenMint);

      tokenBalance = {
        address: tokenAccount.toString(),
        balance: Number(accountInfo.amount),
        decimals: mintInfo.decimals,
        uiAmount: Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals)
      };
    } catch (error) {
      if (
        error instanceof TokenAccountNotFoundError ||
        error instanceof TokenInvalidAccountOwnerError
      ) {
        // Token account doesn't exist yet
        tokenBalance = {
          address: '',
          balance: 0,
          decimals: 0,
          uiAmount: 0
        };
      }
    }

    return {
      solBalance: solBalance / LAMPORTS_PER_SOL,
      tokenBalance
    };
  }

  async isValidWalletAddress(address: string): Promise<boolean> {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  // Token Methods
  async getTokenInfo(): Promise<{
    mint: string;
    decimals: number;
    supply: string;
    isInitialized: boolean;
  }> {
    const mintInfo = await getMint(this.connection, this.tokenMint);

    return {
      mint: this.tokenMint.toString(),
      decimals: mintInfo.decimals,
      supply: mintInfo.supply.toString(),
      isInitialized: mintInfo.isInitialized
    };
  }

  async createTokenAccount(
    ownerWallet: string,
    payerKeypair: Keypair
  ): Promise<TransactionResult> {
    const owner = new PublicKey(ownerWallet);
    const associatedTokenAddress = await getAssociatedTokenAddress(
      this.tokenMint,
      owner
    );

    // Check if account already exists
    try {
      await getAccount(this.connection, associatedTokenAddress);
      return {
        signature: '',
        success: true,
        error: 'Account already exists'
      };
    } catch (error) {
      if (
        !(error instanceof TokenAccountNotFoundError) &&
        !(error instanceof TokenInvalidAccountOwnerError)
      ) {
        throw error;
      }
    }

    // Create the associated token account
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payerKeypair.publicKey, // payer
        associatedTokenAddress, // ata
        owner, // owner
        this.tokenMint // mint
      )
    );

    try {
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [payerKeypair]
      );

      return {
        signature,
        success: true
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Transfer Methods
  async transferTokens(
    params: TransferParams,
    fromKeypair: Keypair
  ): Promise<TransactionResult> {
    const fromPublicKey = new PublicKey(params.fromWallet);
    const toPublicKey = new PublicKey(params.toWallet);

    const fromTokenAccount = await getAssociatedTokenAddress(
      this.tokenMint,
      fromPublicKey
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      this.tokenMint,
      toPublicKey
    );

    const mintInfo = await getMint(this.connection, this.tokenMint);
    const amount = params.amount * Math.pow(10, mintInfo.decimals);

    const transaction = new Transaction();

    // Check if recipient token account exists, create if not
    try {
      await getAccount(this.connection, toTokenAccount);
    } catch (error) {
      if (
        error instanceof TokenAccountNotFoundError ||
        error instanceof TokenInvalidAccountOwnerError
      ) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromKeypair.publicKey, // payer
            toTokenAccount, // ata
            toPublicKey, // owner
            this.tokenMint // mint
          )
        );
      }
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAccount, // source
        toTokenAccount, // destination
        fromPublicKey, // owner
        amount // amount
      )
    );

    try {
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair]
      );

      return {
        signature,
        success: true
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed'
      };
    }
  }

  async transferSol(
    fromKeypair: Keypair,
    toWallet: string,
    amount: number
  ): Promise<TransactionResult> {
    const toPublicKey = new PublicKey(toWallet);
    const lamports = amount * LAMPORTS_PER_SOL;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports
      })
    );

    try {
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair]
      );

      return {
        signature,
        success: true
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'SOL transfer failed'
      };
    }
  }

  // Transaction Methods
  async getTransaction(signature: string): Promise<any> {
    return await this.connection.getTransaction(signature, {
      commitment: 'confirmed'
    });
  }

  async getTransactionStatus(signature: string): Promise<{
    confirmed: boolean;
    finalized: boolean;
    error?: string;
  }> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      
      return {
        confirmed: status.value?.confirmationStatus === 'confirmed' || 
                   status.value?.confirmationStatus === 'finalized',
        finalized: status.value?.confirmationStatus === 'finalized',
        error: status.value?.err ? JSON.stringify(status.value.err) : undefined
      };
    } catch (error) {
      return {
        confirmed: false,
        finalized: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async confirmTransaction(
    signature: string,
    commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'
  ): Promise<boolean> {
    try {
      const result = await this.connection.confirmTransaction(signature, commitment);
      return !result.value.err;
    } catch {
      return false;
    }
  }

  // Program Methods
  async callProgram(
    instruction: TransactionInstruction,
    signers: Keypair[]
  ): Promise<TransactionResult> {
    const transaction = new Transaction().add(instruction);

    try {
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        signers
      );

      return {
        signature,
        success: true
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Program call failed'
      };
    }
  }

  // Utility Methods
  async estimateTransactionFee(transaction: Transaction): Promise<number> {
    const recentBlockhash = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;

    const fees = await this.connection.getFeeForMessage(
      transaction.compileMessage(),
      'confirmed'
    );

    return fees.value || 0;
  }

  async getRecentBlockhash(): Promise<string> {
    const recentBlockhash = await this.connection.getLatestBlockhash();
    return recentBlockhash.blockhash;
  }

  // Account Methods
  async getAccountInfo(address: string): Promise<AccountInfo<Buffer> | null> {
    const publicKey = new PublicKey(address);
    return await this.connection.getAccountInfo(publicKey);
  }

  async getTokenAccountsByOwner(owner: string): Promise<any[]> {
    const ownerPublicKey = new PublicKey(owner);
    const response = await this.connection.getTokenAccountsByOwner(
      ownerPublicKey,
      {
        mint: this.tokenMint
      }
    );

    return response.value.map(account => ({
      pubkey: account.pubkey.toString(),
      account: account.account
    }));
  }

  // Monitoring Methods
  async subscribeToAccount(
    address: string,
    callback: (accountInfo: AccountInfo<Buffer>, context: any) => void
  ): Promise<number> {
    const publicKey = new PublicKey(address);
    return this.connection.onAccountChange(publicKey, callback);
  }

  async unsubscribe(subscriptionId: number): Promise<void> {
    await this.connection.removeAccountChangeListener(subscriptionId);
  }

  async subscribeToLogs(
    filter: any,
    callback: (logs: any, context: any) => void
  ): Promise<number> {
    return this.connection.onLogs(filter, callback);
  }

  // Batch Operations
  async batchTransfer(
    transfers: Array<{
      to: string;
      amount: number;
    }>,
    fromKeypair: Keypair
  ): Promise<TransactionResult[]> {
    const results: TransactionResult[] = [];

    for (const transfer of transfers) {
      const result = await this.transferTokens(
        {
          fromWallet: fromKeypair.publicKey.toString(),
          toWallet: transfer.to,
          amount: transfer.amount
        },
        fromKeypair
      );
      results.push(result);
    }

    return results;
  }
}

// Helper Functions
export const SolanaHelpers = {
  generateKeypair(): Keypair {
    return Keypair.generate();
  },

  keypairFromSecretKey(secretKey: Uint8Array): Keypair {
    return Keypair.fromSecretKey(secretKey);
  },

  isValidPublicKey(key: string): boolean {
    try {
      new PublicKey(key);
      return true;
    } catch {
      return false;
    }
  },

  lamportsToSol(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  },

  solToLamports(sol: number): number {
    return sol * LAMPORTS_PER_SOL;
  },

  formatTokenAmount(amount: number, decimals: number): number {
    return amount / Math.pow(10, decimals);
  },

  parseTokenAmount(amount: number, decimals: number): number {
    return amount * Math.pow(10, decimals);
  }
};

// Error Classes
export class SolanaError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SolanaError';
  }
}

export class InsufficientFundsError extends SolanaError {
  constructor(required: number, available: number) {
    super(`Insufficient funds: Required ${required}, Available ${available}`);
    this.name = 'InsufficientFundsError';
  }
}

export class InvalidWalletError extends SolanaError {
  constructor(address: string) {
    super(`Invalid wallet address: ${address}`);
    this.name = 'InvalidWalletError';
  }
}

export class TokenAccountError extends SolanaError {
  constructor(message: string) {
    super(`Token account error: ${message}`);
    this.name = 'TokenAccountError';
  }
}

// Export types and classes
export type {
  SolanaConfig,
  TransferParams,
  StakeParams,
  WithdrawalParams,
  TokenBalance,
  TransactionResult
};